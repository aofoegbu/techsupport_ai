import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertAnalysisResultSchema, insertChatMessageSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze issue endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { inputText, issueType, environment } = req.body;

      if (!inputText) {
        return res.status(400).json({ message: "Input text is required" });
      }

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
Issue Type: ${issueType || "Auto-detect"}
Environment: ${environment || "Not specified"}

Provide analysis in JSON format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const analysisData = JSON.parse(completion.choices[0].message.content || "{}");

      // Store the analysis result
      const analysisResult = await storage.createAnalysisResult({
        inputText,
        rootCause: analysisData.rootCause,
        solutions: analysisData.solutions,
        diagnosticCommands: analysisData.diagnosticCommands,
        issueType: analysisData.issueType,
        environment,
        confidence: analysisData.confidence,
      });

      // Get similar tickets
      const similarTickets = await storage.searchSimilarTickets(inputText, 3);

      res.json({
        analysis: analysisResult,
        similarTickets,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze issue. Please check your OpenAI API key and try again." 
      });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and session ID are required" });
      }

      // Store user message
      await storage.createChatMessage({
        sessionId,
        message,
        isUser: true,
      });

      // Get chat history for context
      const chatHistory = await storage.getChatMessages(sessionId);
      
      const systemPrompt = `You are an AI support assistant helping with technical troubleshooting. 
      Provide helpful, concise, and actionable responses to technical questions. 
      If asked for diagnostic commands, provide them in a clear format.
      Keep responses focused and professional.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10).map(msg => ({
          role: msg.isUser ? "user" as const : "assistant" as const,
          content: msg.message
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0].message.content || "I'm having trouble responding right now.";

      // Store AI response
      const aiMessage = await storage.createChatMessage({
        sessionId,
        message: aiResponse,
        isUser: false,
      });

      res.json({ message: aiMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        message: "Failed to process chat message. Please try again." 
      });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Get similar tickets
  app.get("/api/tickets/similar", async (req, res) => {
    try {
      const { query, limit } = req.query;
      const tickets = await storage.searchSimilarTickets(
        query as string || "", 
        limit ? parseInt(limit as string) : 3
      );
      res.json({ tickets });
    } catch (error) {
      console.error("Similar tickets error:", error);
      res.status(500).json({ message: "Failed to fetch similar tickets" });
    }
  });

  // Get all tickets
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json({ tickets });
    } catch (error) {
      console.error("Tickets error:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
