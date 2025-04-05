import React, { useState, useEffect, useRef } from 'react';
import { User, PhoneCall, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmergencyAnalysisBot } from "./EmergencyAnalysisBot";

export function EmergencyChat({ callId }) {
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);

  const fetchCallData = async () => {
    try {
      const response = await fetch('/data.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Find the specific call by ID
      const call = data.find(call => call.callId === callId);
      if (call) {
        setCallData(call);
      } else {
        setError(`No call found with ID: ${callId}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCallData();
  }, [callId]);

  // Set up polling for updates (every 10 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCallData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [callId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [callData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="h-full flex items-center justify-center md:col-span-2">
          <div className="text-center">Loading conversation...</div>
        </Card>
        <div className="h-full">
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">Loading analysis...</div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="h-full flex items-center justify-center md:col-span-2">
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Error: {error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        <div className="h-full">
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">No analysis available</div>
          </Card>
        </div>
      </div>
    );
  }

  if (!callData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="h-full flex items-center justify-center md:col-span-2">
          <div className="text-center">No call data found</div>
        </Card>
        <div className="h-full">
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">No analysis available</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Chat panel - takes up 2/3 of the space on larger screens */}
      <Card className="h-full flex flex-col shadow-none md:col-span-2">
        <CardHeader className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">{callData.callId}</CardTitle>
              <CardDescription className="text-xs">
                {callData.conversation?.length || 0} messages
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                callData.status === "completed" ? "bg-green-100 text-green-800" : 
                callData.status === "in-progress" ? "bg-blue-100 text-blue-800" : 
                callData.status === "canceled" ? "bg-red-100 text-red-800" : ""
              } px-2 py-0.5 text-xs capitalize`}
            >
              {callData.status}
            </Badge>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 px-3" ref={scrollAreaRef}>
          <CardContent className="py-1">
            {callData.conversation?.map((message, index) => (
              <div 
                key={index}
                className={`flex items-start gap-2 mb-2 ${
                  message.speaker === "dispatcher" ? "justify-start" : "justify-end"
                }`}
              >
                {message.speaker === "dispatcher" && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <PhoneCall className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`rounded-lg px-2 py-1.5 max-w-[85%] text-xs ${
                    message.speaker === "dispatcher" 
                      ? "bg-muted" 
                      : "bg-primary text-primary-foreground ml-auto"
                  }`}
                >
                  <div className="text-[10px] opacity-70 font-medium capitalize">
                    {message.speaker}
                  </div>
                  <div>{message.message}</div>
                </div>
                {message.speaker === "caller" && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </CardContent>
        </ScrollArea>
        <CardFooter className="p-2 border-t">
          <div className="w-full text-center text-muted-foreground py-1 text-xs">
            {callData.status === "completed" 
              ? "This call has been completed." 
              : callData.status === "in-progress"
              ? "View-only mode: You cannot send messages in this interface."
              : "This call has been canceled."}
          </div>
        </CardFooter>
      </Card>

      {/* Analysis panel - takes up 1/3 of the space on larger screens */}
      <div className="h-full">
        <EmergencyAnalysisBot callData={callData} />
      </div>
    </div>
  );
}

export default EmergencyChat;