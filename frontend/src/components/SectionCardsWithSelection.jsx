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

        return response.json();
      })
      .then(data => {
        // Check if data.call_ids is an array and use it
        if (Array.isArray(data.call_ids)) {
          setCalls(data.call_ids); // Use call_ids directly
        } else {
          console.error("Error: call_ids is not an array", data);
          setCalls([]); // Set to empty array if call_ids is not an array
        }
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
      {calls.map((callId) => (
        <Card
          key={callId}
          className={`transition-all hover:shadow-sm cursor-pointer ${
            selectedId === callId ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => handleSelect(callId)}
        >
          <div className="p-2">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium call-id">
                Calls {callId}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default SectionCardsWithSelection;
