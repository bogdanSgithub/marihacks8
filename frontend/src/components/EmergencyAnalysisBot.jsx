import React, { useState, useEffect } from 'react';
import { Bot, MapPin, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function EmergencyAnalysisBot({ callData, onAddressExtracted }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Function to analyze conversation using a free AI service
  const analyzeConversation = async (conversation) => {
    setLoading(true);
    try {
      // In a real implementation, you would make an API call to OpenAI/Gemini here
      // For now, we'll simulate the AI analysis with a local function
      
      // Extract data from the conversation
      const extractedData = extractDataFromConversation(conversation);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysis(extractedData);
      
      // Send the extracted address to the parent component
      if (onAddressExtracted && extractedData.address) {
        onAddressExtracted(extractedData.address);
      }
    } catch (err) {
      setError("Failed to analyze conversation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract data from conversation
  const extractDataFromConversation = (conversation) => {
    let address = "Unknown location";
    let description = "No threat description available";
    let summary = "";

    // Simple pattern matching to extract information
    for (const message of conversation) {
      const text = message.message.toLowerCase();
      
      // Extract address
      if (message.speaker === "caller" && 
         (text.includes("at ") || text.includes("address") || text.includes("located"))) {
        // Simple address extraction
        const addressWords = message.message.split(/(?:at|is|address is|located at)\s+/i);
        if (addressWords.length > 1) {
          address = addressWords[1].trim();
        } else {
          address = message.message;
        }
      }
      
      // Extract threat description
      if (message.speaker === "caller" && 
         (text.includes("fire") || text.includes("emergency") || text.includes("accident") ||
          text.includes("suspect") || text.includes("injured") || text.includes("threat"))) {
        description = message.message;
      }
    }
    
    // Generate summary
    summary = generateSummary(conversation);
    
    return { address, description, summary };
  };

  // Generate a short summary (under 25 words)
  const generateSummary = (conversation) => {
    // Simple summary generation based on keywords
    let emergencyType = "Unknown emergency";
    let location = "unknown location";
    let status = "in progress";
    
    for (const message of conversation) {
      const text = message.message.toLowerCase();
      
      // Detect emergency type
      if (text.includes("fire")) emergencyType = "Fire";
      else if (text.includes("accident")) emergencyType = "Accident";
      else if (text.includes("injury") || text.includes("injured")) emergencyType = "Medical";
      else if (text.includes("theft") || text.includes("stolen")) emergencyType = "Theft";
      else if (text.includes("suspect") || text.includes("suspicious")) emergencyType = "Suspicious activity";
      
      // Extract location
      if (message.speaker === "caller" && text.includes("at ")) {
        const parts = message.message.split("at ");
        if (parts.length > 1) location = parts[1].trim();
      }
      
      // Check status
      if (text.includes("resolved") || text.includes("safe now")) status = "resolved";
    }
    
    return `${emergencyType} at ${location}. Status: ${status}.`.substring(0, 100);
  };

  // Trigger analysis when conversation data changes
  useEffect(() => {
    if (callData && callData.conversation) {
      analyzeConversation(callData.conversation);
    }
  }, [callData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Bot className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Analyzing emergency conversation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">No analysis available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Emergency Analysis</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">AI Generated</Badge>
        </CardTitle>
        {analysis.summary && (
          <CardDescription>
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertTitle className="text-xs font-medium">Live Summary</AlertTitle>
              <AlertDescription className="text-xs">{analysis.summary}</AlertDescription>
            </Alert>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address is now sent to the parent component, not displayed here */}
        
        <div>
          <h3 className="text-xs font-medium flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3" /> Threat Description
          </h3>
          <p className="text-sm border rounded-md p-2 bg-muted">{analysis.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmergencyAnalysisBot;