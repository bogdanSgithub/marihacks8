import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin, Navigation, Map } from "lucide-react";

import { SectionCardsWithSelection } from './SectionCardsWithSelection';
import { EmergencyChat } from './EmergencyChat';
import { EmergencyLocationMap } from './EmergencyLocationMap';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmergencySystem() {
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [extractedAddress, setExtractedAddress] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  
  // Function to handle call selection
  const handleCallSelect = (callId) => {
    setSelectedCallId(callId);
    setExtractedAddress(null); // Reset address when a new call is selected
  };
  
  // Function to handle address extraction
  const handleAddressExtracted = (address) => {
    setExtractedAddress(address);
  };
  
  // Function to toggle map type
  const toggleMapType = () => {
    setMapType(mapType === "roadmap" ? "satellite" : "roadmap");
  };
  
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
            <div className="w-1/2 p-4 h-full">
              <Card className="h-full flex flex-col">
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
                    address={extractedAddress} 
                    mapType={mapType} 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Chat and Analysis Section - Right */}
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