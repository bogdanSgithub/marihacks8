import React from 'react';
import { MapPin, AlertTriangle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function EmergencyLocationMap({ address, mapType = "roadmap" }) {
  const extractCleanAddress = (text) => {
    if (!text) return "";
    
    // Try to extract what looks most like an address
    // This is a simplified approach - in a real system, you'd use a more robust address parser
    const words = text.split(' ');
    if (words.length <= 5) return text; // If short, use the whole thing
    
    // Otherwise try to find the most address-like portion
    const statePattern = /\b[A-Z]{2}\b/; // Look for state abbreviation
    const zipPattern = /\b\d{5}(?:-\d{4})?\b/; // Look for ZIP code
    
    // If we find ZIP code, take everything before it plus the ZIP
    const zipMatch = text.match(zipPattern);
    if (zipMatch) {
      const zipIndex = text.indexOf(zipMatch[0]);
      const endIndex = zipIndex + zipMatch[0].length;
      return text.substring(0, endIndex);
    }
    
    // Try our best with the full text
    return text;
  };

  if (!address) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/50 rounded-md">
        <div className="text-center text-muted-foreground">
          No address available for this emergency
        </div>
      </div>
    );
  }

  // Clean up the address for map display
  const cleanAddress = extractCleanAddress(address);
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddress)}&t=${mapType === "satellite" ? "k" : "m"}&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-1 p-1.5 bg-muted rounded-md text-xs">
        <p className="font-medium text-xs">Address:</p>
        <p className="truncate">{cleanAddress}</p>
      </div>
      <div className="flex-1 bg-muted/30 rounded-md overflow-hidden">
        <iframe
          title={`Emergency Location - ${mapType}`}
          className="w-full h-full border-0"
          src={mapUrl}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default EmergencyLocationMap;