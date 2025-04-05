// GeminiAddressExtractor.js
// This is a utility function that works in the background to extract addresses

// API key and URL are directly embedded for simplicity
const apiKey = "AIzaSyAh2qi-zgjWVVNgYL8h6sJzaA6xX2Vlb8A";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// Helper function to fetch chat responses
async function fetchChat(requestData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

// Main function to analyze messages and extract address
// Returns a promise that resolves to the extracted address or null if not found
export async function extractAddressFromMessages(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }
  
  try {
    // Combine all message content into a single text for analysis
    const combinedText = messages.map(msg => {
      const role = msg.role === "user" ? "Caller" : "Emergency Operator";
      const content = msg.transcript || msg.content || "";
      return `${role}: ${content}`;
    }).join("\n\n");

    // Create the request data
    const requestData = {
      contents: [{
        parts: [{
          text: `I need you to extract a precise address or location from this emergency call transcript. Extract ONLY the address or location (like street names, building numbers, landmarks, intersections, etc.). Only return the exact address text, nothing else. If no clear address is found, respond with "NO_ADDRESS_FOUND".\n\nEmergency Call Transcript:\n${combinedText}`
        }]
      }]
    };

    // Call the Gemini API
    const extractedText = await fetchChat(requestData);

    // Check if address was found
    if (extractedText && extractedText !== "NO_ADDRESS_FOUND") {
      console.log("Address found:", extractedText);
      return extractedText;
    } else {
      console.log("No address found in messages");
      return null;
    }
  } catch (error) {
    console.error("Error extracting address:", error);
    return null;
  }
}

// Optional: A hook to use the address extractor in components
export function useAddressExtractor(messages, onChange) {
  React.useEffect(() => {
    if (messages && messages.length > 0) {
      let cancelled = false;2
      
      extractAddressFromMessages(messages).then(address => {
        if (!cancelled && address) {
          onChange(address);
        }
      });
      
      return () => {
        cancelled = true;
      };
    }
  }, [messages, onChange]);
}

export default extractAddressFromMessages;