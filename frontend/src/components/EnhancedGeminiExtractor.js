// EnhancedGeminiExtractor.js
// Enhanced utility that extracts complete emergency information

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

// Map emergency types to image files
const emergencyTypeToImage = {
  'assault': '/public/assault.png',
  'break-in': '/public/breakintohouse.png',
  'breaking and entering': '/public/breakintohouse.png',
  'burglary': '/public/breakintohouse.png',
  'hate crime': '/public/hatecrime.png',
  'homicide': '/public/homocide.png',
  'murder': '/public/homocide.png',
  'major crime': '/public/majorcrime.png',
  'shooting': '/public/shooting.png',
  'theft': '/public/theft.png',
  'fire': '/public/majorcrime.png',
  'arson': '/public/majorcrime.png',
  // Default fallback
  'default': '/public/majorcrime.png'
};

// Function to determine image based on emergency type
function getEmergencyImage(type) {
  if (!type) return emergencyTypeToImage.default;
  
  const lowerType = type.toLowerCase();
  
  // Check for direct matches
  if (emergencyTypeToImage[lowerType]) {
    return emergencyTypeToImage[lowerType];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(emergencyTypeToImage)) {
    if (lowerType.includes(key)) {
      return value;
    }
  }
  
  // Default fallback
  return emergencyTypeToImage.default;
}

// Main function to extract complete emergency information
export async function extractEmergencyInfo(messages) {
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

    // Create the request data for structured information extraction
    const requestData = {
      contents: [{
        parts: [{
          text: `
Analyze this emergency call transcript and extract the following information in JSON format:
1. title: A concise title for this emergency (5-7 words max)
2. address: The exact location/address of the emergency
3. type: The type of emergency (assault, break-in, hate crime, homicide, shooting, theft, etc.)
4. summary: A brief 2-3 sentence summary of the situation
5. short_summary: An ultra-concise 1-line summary (10-15 words max)
6. time: The time of the incident if mentioned, or current time if not specified

Return ONLY a valid JSON object with these fields. If any field cannot be determined, use null for that field.

Emergency Call Transcript:
${combinedText}`
        }]
      }]
    };

    // Call the Gemini API
    const response = await fetchChat(requestData);
    
    if (!response) return null;
    
    // Parse the JSON response
    try {
      // Attempt to extract just the JSON part if there's additional text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      const emergencyInfo = JSON.parse(jsonString);
      
      // Add the appropriate image based on the emergency type
      emergencyInfo.image = getEmergencyImage(emergencyInfo.type);
      
      // Add current time if not specified
      if (!emergencyInfo.time) {
        emergencyInfo.time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
      
      return emergencyInfo;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.log("Raw response:", response);
      return null;
    }
  } catch (error) {
    console.error("Error extracting emergency info:", error);
    return null;
  }
}

// For backward compatibility - extract just the address
export async function extractAddressFromMessages(messages) {
  const emergencyInfo = await extractEmergencyInfo(messages);
  return emergencyInfo ? emergencyInfo.address : null;
}

export default extractEmergencyInfo;