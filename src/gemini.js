// --- GEMINI API INTEGRATION ---
const apiKey = "AIzaSyDtNAC69JwPDbvc4Qrsqo23XjN1QEpzKcQ"; 

const callGemini = async (prompt) => {
  if (!apiKey) return "Error: No API Key found.";

  // UPDATED: gemini-1.5-flash is retired. 
  // Use gemini-2.5-flash (stable) or gemini-3-flash-preview (frontier).
  const MODEL_ID = "gemini-2.5-flash"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;
  
  let delay = 1000;

  for (let i = 0; i < 5; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.8,
            topP: 0.95,
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ghost Field Error:", errorData);
        throw new Error(errorData.error?.message || "Interference Detected");
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "The echoes are silent.";

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Attempt ${i + 1} failed:`, error.message);

      if (i === 4) return "Error: The ghost field is highly volatile. The link to Doskvol has been severed.";
      
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; 
    }
  }
};

export { callGemini };