
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateExecutiveSummary = async (data: object) => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key is missing.");

  const prompt = `
    You are a senior data analyst for Investa Admin. 
    Analyze the following dashboard data JSON and provide:
    1. A brief executive summary (max 2 sentences).
    2. Three actionable bullet points for improvement or attention.
    
    Data:
    ${JSON.stringify(data)}
    
    Format the response as plain text but use Markdown for the bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const performAiSearch = async (query: string, data: any) => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key is missing.");

  const prompt = `
    User Search Query: "${query}"
    
    Application Data Snapshot:
    ${JSON.stringify(data)}

    Instructions:
    Interpret the user's intent. They are searching an admin portal for Investa.
    Find relevant users, dashboard metrics, or ledger accounts from the Chart of Accounts.
    If they ask "What's the balance of Petty Cash?", find the Petty Cash account.
    If they ask about performance, return the relevant stat.
    If they search for a person, return the user record.
    
    Return a list of matches.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "One of: user, stat, account, general" },
                  id: { type: Type.STRING, description: "The ID of the matching item if applicable" },
                  title: { type: Type.STRING, description: "Name of the item or metric" },
                  subtitle: { type: Type.STRING, description: "Brief detail like email, value, or account code" },
                  explanation: { type: Type.STRING, description: "Why this is relevant to the search query" }
                },
                required: ["type", "title", "subtitle", "explanation"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"results":[]}');
    return parsed.results;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};
