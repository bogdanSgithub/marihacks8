import React, { useState, useEffect, useRef } from 'react';
import { User, PhoneCall } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function EmergencyChat({ callId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://marihacks8.onrender.com/api/messages?call_id=${callId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Handle the API response format
      if (data && data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
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
          setMessages(extractedMessages);
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
    }
  };

  // Initial fetch when component mounts or callId changes
  useEffect(() => {
    if (callId) {
      fetchMessages();
    }
  }, [callId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">Loading conversation...</div>
      </Card>
    );
  }

  if (error && messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg">Emergency Conversation</CardTitle>
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
    </Card>
  );
}

export default EmergencyChat;