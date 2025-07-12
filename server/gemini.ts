import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  rootCause: string;
  solutions: Array<{ title: string; description: string }>;
  diagnosticCommands: Array<{ description: string; command: string }>;
  issueType: string;
  confidence: number;
}

export async function analyzeIssue(inputText: string, issueType?: string, environment?: string): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert support engineer AI assistant. Analyze the provided error message, log, or technical issue and provide a structured response in JSON format.

Your response should include:
1. rootCause: A clear explanation of what's causing the issue
2. solutions: An array of recommended solutions with title and description
3. diagnosticCommands: An array of useful diagnostic commands with description and command
4. issueType: The type of issue (database, network, application, performance, etc.)
5. confidence: A confidence score from 1-100

Be specific, actionable, and professional in your recommendations.`;

  const userPrompt = `Analyze this technical issue:

Input: ${inputText}
Issue Type: ${!issueType || issueType === "auto-detect" ? "Auto-detect" : issueType}
Environment: ${!environment || environment === "all" ? "Not specified" : environment}

Provide analysis in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rootCause: { type: "string" },
            solutions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["title", "description"]
              }
            },
            diagnosticCommands: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  command: { type: "string" }
                },
                required: ["description", "command"]
              }
            },
            issueType: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["rootCause", "solutions", "diagnosticCommands", "issueType", "confidence"]
        }
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: AnalysisResult = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    throw new Error(`Failed to analyze issue: ${error}`);
  }
}

export async function generateChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
  try {
    const systemPrompt = `You are an AI support assistant helping with technical troubleshooting. 
    Provide helpful, concise, and actionable responses to technical questions. 
    If asked for diagnostic commands, provide them in a clear format.
    Keep responses focused and professional.`;

    // Convert messages to Gemini format
    const conversationHistory = messages
      .filter(msg => msg.role !== "system")
      .map(msg => msg.content)
      .join("\n\n");

    const prompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I'm having trouble responding right now.";
  } catch (error) {
    throw new Error(`Failed to generate chat response: ${error}`);
  }
}