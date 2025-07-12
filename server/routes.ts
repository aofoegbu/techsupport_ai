import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeIssue, generateChatResponse } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Analysis endpoint using Gemini
  app.post("/api/analyze", async (req, res) => {
    try {
      const { inputText, issueType, environment } = req.body;
      
      if (!inputText) {
        return res.status(400).json({ message: "Input text is required" });
      }
      
      const analysisResult = await analyzeIssue(inputText, issueType, environment);
      
      // Store analysis result
      await storage.createAnalysisResult({
        inputText,
        issueType: issueType || "general",
        environment: environment || "unknown",
        rootCause: analysisResult.rootCause,
        solutions: JSON.stringify(analysisResult.solutions),
        diagnosticCommands: JSON.stringify(analysisResult.diagnosticCommands),
        confidence: analysisResult.confidence
      });
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze issue. Please check your Gemini API key and try again." 
      });
    }
  });

  // Chat endpoint using Gemini
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and session ID are required" });
      }
      
      // Get chat history for context
      const chatHistory = await storage.getChatMessages(sessionId);
      
      // Prepare messages for AI
      const messages = [
        ...chatHistory.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.message
        })),
        { role: "user", content: message }
      ];
      
      const aiResponse = await generateChatResponse(messages);
      
      // Store user message
      await storage.createChatMessage({
        sessionId,
        message,
        isUser: true
      });
      
      // Store AI response
      await storage.createChatMessage({
        sessionId,
        message: aiResponse,
        isUser: false
      });
      
      res.json({ message: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        message: "Failed to process chat message. Please try again." 
      });
    }
  });

  // Chat history endpoint
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ 
        message: "Failed to fetch chat history. Please try again." 
      });
    }
  });

  // Similar tickets endpoint
  app.get("/api/similar-tickets", async (req, res) => {
    try {
      const { query } = req.query;
      const tickets = await storage.searchSimilarTickets(query as string || "");
      res.json({ tickets });
    } catch (error) {
      console.error("Similar tickets error:", error);
      res.status(500).json({ 
        message: "Failed to fetch similar tickets. Please try again." 
      });
    }
  });

  // All tickets endpoint
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json({ tickets });
    } catch (error) {
      console.error("Tickets error:", error);
      res.status(500).json({ 
        message: "Failed to fetch tickets. Please try again." 
      });
    }
  });

  const server = createServer(app);
  return server;
}