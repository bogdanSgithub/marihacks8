import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SectionCardsWithSelection({ onSelectCall }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCalls = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('https://marihacks8.onrender.com/api/calls');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle the new JSON format { "calls": [ { "call_id": "1", "phone_number": "4383089263" } ] }
      if (Array.isArray(data.calls)) {
        setCalls(data.calls);
      } else {
        console.error("Error: calls is not an array", data);
        setCalls([]); // Set to empty array if calls is not an array
      }
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format phone number to (XXX) XXX-XXXX
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a 10-digit number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      // Handle 11-digit number with country code
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    // If not 10 digits, just format with spaces for readability
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Initial fetch
  useEffect(() => {
    fetchCalls();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCalls();
    }, 5000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleSelect = (call) => {
    setSelectedId(call.call_id);
    onSelectCall(call.call_id);
  };

  const handleManualRefresh = () => {
    fetchCalls();
  };

  if (loading && !refreshing) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-2">
        <h3 className="text-sm font-medium">Available Calls</h3>
        <button
          onClick={handleManualRefresh}
          className="p-1 rounded-full hover:bg-gray-100"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`${refreshing ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
        </button>
      </div>
      
      {error && (
        <div className="p-2 text-red-500 text-sm flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}
      
      {!error && calls.length === 0 && (
        <div className="p-2 text-center text-gray-500 text-sm">
          No calls available
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-1">
        <div className="space-y-1">
          {calls.map((call) => (
            <Card
              key={call.call_id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                selectedId === call.call_id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(call)}
            >
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      Call {formatPhoneNumber(call.phone_number)}
                    </span>
                  </div>
                  {selectedId === call.call_id && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SectionCardsWithSelection;