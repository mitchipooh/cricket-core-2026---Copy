
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDLSAnalysis = async (
  score: number,
  overs: number,
  wickets: number,
  target: number,
  weather: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this cricket match scenario for a DLS (Duckworth-Lewis-Stern) target.
      Current Score: ${score}/${wickets}
      Overs Bowled: ${overs}
      Target to Win: ${target}
      Weather Condition: ${weather}
      Provide a revised target if rain stops play now, and a brief tactical suggestion for the batting team.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revisedTarget: { type: Type.NUMBER },
            tacticalAdvice: { type: Type.STRING },
            winningProbability: { type: Type.NUMBER, description: "Percentage probability for the batting team" }
          },
          required: ["revisedTarget", "tacticalAdvice", "winningProbability"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini DLS error:", error);
    return null;
  }
};

export const getSmartCoachAdvice = async (matchState: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Senior Cricket Coach. Look at this match state: ${JSON.stringify(matchState)}. 
      Give 3 bullet points of tactical advice for the bowling team to break the partnership.`,
    });
    return response.text;
  } catch (error) {
    return "Keep bowling tight lines and pressure the batsmen.";
  }
};
