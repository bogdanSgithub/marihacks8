import React, { useState, useEffect, useRef } from 'react';
import { User, PhoneCall, RefreshCw, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function EmergencyChat({ callId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const scrollAreaRef = useRef(null);
  const prevMessageLengthRef = useRef(0);

  const fetchMessages = async () => {
    if (!callId) return;
    
    try {
      // Only show loading on initial fetch, otherwise use refreshing state
      if (messages.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await fetch(`https://marihacks8.onrender.com/api/messages?call_id=${callId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Handle the API response format
      if (data && data.messages && Array.isArray(data.messages)) {
        // Update last message ID for notification purposes
        if (data.messages.length > 0) {
          const latestMsg = data.messages[data.messages.length - 1];
          setLastMessageId(latestMsg.id || Date.now().toString());
        }
        
        prevMessageLengthRef.current = messages.length;
        setMessages(data.messages);
        setError(null);
      } else if (data && typeof data === 'object') {
        // Fallback in case the API response structure changes
        const extractedMessages = [];
        
        // Try to extract messages if they're not in the expected format
        Object.keys(data).forEach(key => {
          if (key.includes('message') && Array.isArray(data[key])) {
            extractedMessages.push(...data[key]);
          }
        });
        
        if (extractedMessages.length > 0) {
          prevMessageLengthRef.current = messages.length;
          setMessages(extractedMessages);
          setError(null);
        } else {
          setError('No messages found in the response');
        }
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch when component mounts or callId changes
  useEffect(() => {
    if (callId) {
      fetchMessages();
    } else {
      setMessages([]);
      setError(null);
      setLoading(false);
    }
  }, [callId]);

  // Auto-refresh messages every second
  useEffect(() => {
    if (!callId) return;
    
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 1000);
    
    return () => clearInterval(intervalId); // Cleanup on unmount or callId change
  }, [callId]);

  const handleManualRefresh = () => {
    fetchMessages();
  };

  if (loading && messages.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-lg">Emergency Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-14 w-2/3 rounded-lg" />
            </div>
            <div className="flex items-start gap-3 justify-end">
              <Skeleton className="h-10 w-1/2 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-20 w-3/4 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && messages.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-lg">Emergency Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Error: {error}</p>
            <button 
              onClick={handleManualRefresh}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-none">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Emergency Conversation</CardTitle>
        <button 
          onClick={handleManualRefresh} 
          className="p-1 rounded-full hover:bg-muted"
          disabled={refreshing}
          title="Refresh messages"
        >
          <RefreshCw size={16} className={`${refreshing ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
        </button>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <CardContent className="py-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages available
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 mb-3 ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <PhoneCall className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                    message.role === "assistant" 
                      ? "bg-muted" 
                      : "bg-primary text-primary-foreground ml-auto"
                  }`}
                >
                  {message.transcript || message.content || ""}
                </div>
                
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
      
      {refreshing && (
        <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <RefreshCw size={12} className="animate-spin" />
            <span>Updating conversation...</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default EmergencyChat;