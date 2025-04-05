import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, AlertTriangle } from "lucide-react";

export function EmergencySummaryCard({ emergencyInfo }) {
  if (!emergencyInfo) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="p-0">
          <Skeleton className="h-48 w-full" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { title, address, type, summary, short_summary, time, image } = emergencyInfo;

  // Helper function to determine badge color based on emergency type
  const getBadgeVariant = (emergencyType) => {
    if (!emergencyType) return "outline";
    
    const type = emergencyType.toLowerCase();
    if (type.includes('fire') || type.includes('homicide') || type.includes('shooting')) {
      return "destructive";
    } else if (type.includes('assault') || type.includes('break') || type.includes('theft')) {
      return "warning";
    } else {
      return "secondary";
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative h-48">
        <div className="w-full h-full flex justify-center items-center overflow-hidden">
          <img 
            src={image || "/public/majorcrime.png"} 
            alt={type || "Emergency"} 
            className="h-full object-contain"
          />
        </div>
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={getBadgeVariant(type)} className="uppercase text-xs font-bold">
            {type || "Emergency"}
          </Badge>
        </div>
        {/* Semi-transparent overlay for better title readability */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-1/2 z-10" />
        <CardTitle className="absolute bottom-3 left-3 right-3 text-white text-xl font-bold line-clamp-2 z-10">
          {title || "Emergency Situation"}
        </CardTitle>
      </div>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{time || "--:--"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{address || "Location unknown"}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {summary || short_summary || "Emergency details not available."}
        </p>
      </CardContent>
    </Card>
  );
}

export default EmergencySummaryCard;