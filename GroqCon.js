const API = "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";
export const askGroq = async (prompt) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",

      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API Error: ${res.status} - ${res.statusText}`);
  }

  const data = await res.json();

  return data.choices[0].message.content;
};

export const GroqBuddy = async (WD) => {
  if (!WD || !WD.main) {
    return {
      advice: [
        "City not found",
        "Check spelling",
        "Try again",
        "No data",
        "Search city",
      ],
    };
  }

  const prompt = `
  
  
  "Act as a professional weather assistant. 
  Based on the data provided, give me exactly 5 pieces of advice.

  STRICT RULES:
  1. Each advice MUST be a short command (maximum 5 words).
  2. NO explanations. Do not use the word "because" or "as".
  3. Format: "Action; Object" (e.g., "Take umbrella", "Wear sunscreen").
  4. Return ONLY a valid JSON object. No intro or outro text.

  JSON STRUCTURE: 
  {"advice": ["advice 1", "advice 2", "advice 3", "advice 4", "advice 5"]}

  WEATHER DATA:
  - City: ${WD.name}
  - Temp: ${Math.round(WD.main.temp)}°C
  - Condition: ${WD.weather[0].main}
  - Humidity: ${WD.main.humidity}%
  - Wind: ${WD.wind.speed} m/s
  `;
  const groqReply = await askGroq(prompt);
  return JSON.parse(groqReply);
};
