import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Navigation, Map } from "lucide-react";

import { SectionCardsWithSelection } from './SectionCardsWithSelection';
import { EmergencyChat } from './EmergencyChat';
import { EmergencyLocationMap } from './EmergencyLocationMap';
import { EmergencySummaryCard } from './EmergencySummaryCard';
import { extractEmergencyInfo } from './EnhancedGeminiExtractor';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";

export function EmergencySystem() {
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [messages, setMessages] = useState([]);
  
  // Function to handle call selection
  const handleCallSelect = (callId) => {
    setSelectedCallId(callId);
    setEmergencyInfo(null); // Reset emergency info when a new call is selected
  };
  
  // Function to toggle map type
  const toggleMapType = () => {
    setMapType(mapType === "roadmap" ? "satellite" : "roadmap");
  };

  // Function to fetch messages for the current call
  const fetchMessages = async () => {
    if (!selectedCallId) return;
    
    try {
      const response = await fetch(`https://marihacks8.onrender.com/api/messages?call_id=${selectedCallId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data && data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
        // If we have new messages, extract emergency information
        analyzeEmergency(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Function to analyze emergency information
  const analyzeEmergency = async (msgs) => {
    if (!msgs || msgs.length === 0) return;
    
    const info = await extractEmergencyInfo(msgs);
    
    if (info) {
      setEmergencyInfo(info);
    }
  };

  // Fetch messages when call ID changes
  useEffect(() => {
    if (selectedCallId) {
      fetchMessages();
    }
  }, [selectedCallId]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedCallId) return;
    
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [selectedCallId]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sticky Sidebar - Call Dashboard */}
      <div className="w-1/4 border-r bg-muted/30 overflow-hidden flex flex-col h-screen sticky top-0 left-0">
        <div className="p-4 border-b bg-background">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Calls
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a call to view details
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <SectionCardsWithSelection onSelectCall={handleCallSelect} />
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex h-screen">
        {!selectedCallId ? (
          <div className="flex items-center justify-center h-full w-full text-center p-6">
            <div>
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-medium mb-2">No Call Selected</h3>
              <p className="text-muted-foreground">
                Please select an emergency call from the sidebar to view details and location
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Map Section - Left */}
            <div className="w-1/2 p-4 h-full flex flex-col">
              {/* Map Card - Top */}
              <Card className="flex-1 flex flex-col mb-4">
                <CardHeader className="py-3 px-4 flex-row justify-between items-center space-y-0">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> 
                      {mapType === "roadmap" ? "Street Map" : "Satellite View"}
                    </CardTitle>
                    <CardDescription className="text-xs">Call ID: {selectedCallId}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleMapType}
                    className="h-8 px-2 text-xs flex items-center gap-1"
                  >
                    {mapType === "roadmap" ? (
                      <>
                        <Navigation className="h-3 w-3" />
                        <span>Switch to Satellite</span>
                      </>
                    ) : (
                      <>
                        <Map className="h-3 w-3" />
                        <span>Switch to Street</span>
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-3">
                  <EmergencyLocationMap 
                    address={emergencyInfo?.address} 
                    mapType={mapType} 
                  />
                </CardContent>
              </Card>
              
              {/* Emergency Summary Card - Bottom */}
              <div>
                <EmergencySummaryCard emergencyInfo={emergencyInfo} />
              </div>
            </div>
            
            {/* Chat Section - Right */}
            <div className="w-1/2 p-4 h-full overflow-hidden">
              <EmergencyChat 
                callId={selectedCallId} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmergencySystem;