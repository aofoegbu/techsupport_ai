import type { Express } from "express";
import { createServer, type Server } from "http";

// Proxy function to forward requests to Python Flask backend
async function proxyToPython(url: string, method: string, body?: any) {
  const response = await fetch(`http://localhost:5001${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`Python backend error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy analyze endpoint to Python Flask backend
  app.post("/api/analyze", async (req, res) => {
    try {
      const result = await proxyToPython("/api/analyze", "POST", req.body);
      res.json(result);
    } catch (error) {
      console.error("Analysis proxy error:", error);
      res.status(500).json({ 
        message: "Failed to analyze issue. Please check your Gemini API key and try again." 
      });
    }
  });

  // Proxy chat endpoint to Python Flask backend
  app.post("/api/chat", async (req, res) => {
    try {
      const result = await proxyToPython("/api/chat", "POST", req.body);
      res.json(result);
    } catch (error) {
      console.error("Chat proxy error:", error);
      res.status(500).json({ 
        message: "Failed to process chat message. Please try again." 
      });
    }
  });

  // Proxy chat history endpoint to Python Flask backend
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await proxyToPython(`/api/chat/${sessionId}`, "GET");
      res.json(result);
    } catch (error) {
      console.error("Chat history proxy error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Proxy similar tickets endpoint to Python Flask backend
  app.get("/api/tickets/similar", async (req, res) => {
    try {
      const queryParams = new URLSearchParams(req.query as Record<string, string>);
      const result = await proxyToPython(`/api/tickets/similar?${queryParams}`, "GET");
      res.json(result);
    } catch (error) {
      console.error("Similar tickets proxy error:", error);
      res.status(500).json({ message: "Failed to fetch similar tickets" });
    }
  });

  // Proxy all tickets endpoint to Python Flask backend
  app.get("/api/tickets", async (req, res) => {
    try {
      const result = await proxyToPython("/api/tickets", "GET");
      res.json(result);
    } catch (error) {
      console.error("Tickets proxy error:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
