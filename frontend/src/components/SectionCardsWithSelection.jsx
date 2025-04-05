import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";

export function SectionCardsWithSelection({ onSelectCall }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // First try fetching from the API endpoint
    fetch('https://marihacks8.onrender.com/api/call_ids')
      .then(response => {
        if (!response.ok) {
          // If API fails, try the local file as fallback
          return fetch('/data.json');
        }
        return response.json();
      })
      .then(data => {
        // Directly use the data assuming it is an array of call objects with `callId`
        setCalls(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleSelect = (callId) => {
    setSelectedId(callId);
    onSelectCall(callId);
  };

  if (loading) return <div className="p-4 text-center">Loading calls...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!calls || calls.length === 0) return <div className="p-4 text-center">No calls available</div>;

  return (
    <div className="space-y-1">
      {calls.map((call) => (
        <Card
          key={call.callId}
          className={`transition-all hover:shadow-sm cursor-pointer ${
            selectedId === call.callId ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => handleSelect(call.callId)}
        >
          <div className="p-2">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium call-id">
                {call.callId}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default SectionCardsWithSelection;
