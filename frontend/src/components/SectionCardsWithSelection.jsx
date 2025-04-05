import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export function SectionCardsWithSelection({ onSelectCall }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCalls = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('https://marihacks8.onrender.com/api/call_ids');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data.call_ids is an array and use it
      if (Array.isArray(data.call_ids)) {
        setCalls(data.call_ids);
      } else {
        console.error("Error: call_ids is not an array", data);
        setCalls([]); // Set to empty array if call_ids is not an array
      }
      
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCalls();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCalls();
    }, 5000); // 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleSelect = (callId) => {
    setSelectedId(callId);
    onSelectCall(callId);
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
    <div className="space-y-2">
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
      
      <div className="space-y-1 max-h-96 overflow-y-auto p-1">
        {calls.map((callId) => (
          <Card
            key={callId}
            className={`transition-all hover:shadow-md cursor-pointer ${
              selectedId === callId ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleSelect(callId)}
          >
            <div className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm font-medium">
                    Call {callId}
                  </span>
                </div>
                {selectedId === callId && (
                  <CheckCircle2 size={16} className="text-blue-500" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SectionCardsWithSelection;