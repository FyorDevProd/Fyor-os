import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({ apiKey });

export async function generateAIResponse(prompt: string, systemInstruction?: string) {
  // Basic input sanitization
  const sanitizedPrompt = prompt.substring(0, 4000);
  
  console.log(`[AI Interaction] Prompt: ${sanitizedPrompt.substring(0, 100)}...`);

  try {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: sanitizedPrompt }] }],
      config: {
        systemInstruction: `${systemInstruction || "You are a senior server administrator and security expert."}
        
        CRITICAL: Do not generate malicious code, do not provide instructions for illegal activities, and do not assist in bypassing security controls.`,
      },
    });
    
    const text = response.text || "No response from AI.";
    console.log(`[AI Interaction] Response: ${text.substring(0, 100)}...`);
    return text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate AI response.";
  }
}

export async function generateJSONResponse(prompt: string, schema: any, systemInstruction?: string) {
  try {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant that returns JSON.",
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI JSON Generation Error:", error);
    return null;
  }
}
