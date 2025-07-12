import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeIssue, generateChatResponse } from "./gemini";
import { insertAnalysisResultSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze issue endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { inputText, issueType, environment } = req.body;

      if (!inputText) {
        return res.status(400).json({ message: "Input text is required" });
      }

      const analysisData = await analyzeIssue(inputText, issueType, environment);

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
        message: "Failed to analyze issue. Please check your Gemini API key and try again." 
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
      
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        { role: "system", content: "system" },
        ...chatHistory.slice(-10).map(msg => ({
          role: msg.isUser ? "user" as const : "assistant" as const,
          content: msg.message
        })),
        { role: "user", content: message }
      ];

      const aiResponse = await generateChatResponse(messages);

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
