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

export function EmergencyChatAndAnalysis({ callId, onAddressExtracted }) {
  // Initial state setup
  const [callData, setCallData] = useState(null);
  // Remove loading state entirely - we'll use placeholder data instead
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);

  const fetchCallData = async () => {
    // Hide loading state for smoother transitions
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
        // Silent error handling for smoother experience
        console.error(`No call found with ID: ${callId}`);
      }
    } catch (error) {
      // Silent error handling for smoother experience
      console.error("Error fetching call data:", error.message);
    }
  };

  // Initial fetch with smoother loading experience
  useEffect(() => {
    // Set a quick fake placeholder immediately
    // This makes it appear instant to the user
    if (callId) {
      // Instant placeholder data
      const placeholderData = {
        callId: callId,
        status: "in-progress",
        conversation: [
          {
            speaker: "dispatcher",
            message: "Connecting to emergency call data..."
          }
        ]
      };
      
      // Show this immediately if we don't have data yet
      if (!callData) {
        setCallData(placeholderData);
      }
      
      // Then fetch real data
      fetchCallData();
    }
  }, [callId]);

  // Set up polling for updates (every 10 seconds)
  useEffect(() => {
    if (!callId) return;
    
    const intervalId = setInterval(() => {
      // Silently update in the background
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

  // Handle address extraction from the bot
  const handleAddressExtracted = (address) => {
    if (onAddressExtracted) {
      onAddressExtracted(address);
    }
  };

  // Remove loading and only handle important errors
  if (error && !callData) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!callData) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">No call data found</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-none">
      {/* Top analysis section */}
      <div className="p-4 border-b">
        <EmergencyAnalysisBot 
          callData={callData} 
          onAddressExtracted={handleAddressExtracted}
        />
      </div>

      {/* Chat section */}
      <div className="flex-1 flex flex-col">
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
      </div>
    </Card>
  );
}

export default EmergencyChatAndAnalysis;