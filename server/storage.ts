import { 
  users, tickets, analysisResults, chatMessages,
  type User, type InsertUser, type Ticket, type InsertTicket,
  type AnalysisResult, type InsertAnalysisResult,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tickets
  getAllTickets(): Promise<Ticket[]>;
  getTicketById(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  searchSimilarTickets(query: string, limit?: number): Promise<Ticket[]>;
  
  // Analysis Results
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResults(limit?: number): Promise<AnalysisResult[]>;
  
  // Chat Messages
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private analysisResults: Map<number, AnalysisResult>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentTicketId: number;
  private currentAnalysisId: number;
  private currentChatId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.analysisResults = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentAnalysisId = 1;
    this.currentChatId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed some sample tickets for similarity matching
    const sampleTickets: InsertTicket[] = [
      {
        ticketNumber: "TICKET-2847",
        title: "Database connection timeout in production",
        description: "Similar connection pool exhaustion issue resolved by increasing max pool size from 20 to 50 connections.",
        status: "resolved",
        priority: "high",
        assignedTo: "Sarah Chen",
        resolvedBy: "Sarah Chen",
        environment: "production",
        issueType: "database",
        similarity: 95,
        resolution: "Increased connection pool size and implemented connection leak detection",
      },
      {
        ticketNumber: "TICKET-2791",
        title: "Spring Boot DataSource connection failures",
        description: "Connection leak in transaction management caused similar timeout errors.",
        status: "resolved",
        priority: "medium",
        assignedTo: "Mike Rodriguez",
        resolvedBy: "Mike Rodriguez",
        environment: "production",
        issueType: "application",
        similarity: 87,
        resolution: "Fixed transaction management to properly close connections",
      },
      {
        ticketNumber: "TICKET-2756",
        title: "MySQL connection pool exhaustion",
        description: "High load causing database connection timeouts during peak hours.",
        status: "resolved",
        priority: "high",
        assignedTo: "Jennifer Liu",
        resolvedBy: "Jennifer Liu",
        environment: "production",
        issueType: "database",
        similarity: 78,
        resolution: "Optimized queries and implemented connection pooling best practices",
      }
    ];

    sampleTickets.forEach(ticket => {
      this.createTicket(ticket);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTicketById(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticket: Ticket = {
      id,
      ticketNumber: insertTicket.ticketNumber,
      title: insertTicket.title,
      description: insertTicket.description,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      assignedTo: insertTicket.assignedTo || null,
      resolvedBy: insertTicket.resolvedBy || null,
      environment: insertTicket.environment || null,
      issueType: insertTicket.issueType || null,
      similarity: insertTicket.similarity || null,
      resolution: insertTicket.resolution || null,
      createdAt: new Date(),
      resolvedAt: insertTicket.status === "resolved" ? new Date() : null,
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async searchSimilarTickets(query: string, limit = 3): Promise<Ticket[]> {
    const tickets = Array.from(this.tickets.values());
    const queryLower = query.toLowerCase();
    
    return tickets
      .filter(ticket => 
        ticket.status === "resolved" && (
          ticket.title.toLowerCase().includes("database") ||
          ticket.title.toLowerCase().includes("connection") ||
          ticket.description.toLowerCase().includes("timeout") ||
          ticket.description.toLowerCase().includes("pool")
        )
      )
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentAnalysisId++;
    const result: AnalysisResult = {
      id,
      inputText: insertResult.inputText,
      rootCause: insertResult.rootCause || null,
      solutions: insertResult.solutions || null,
      diagnosticCommands: insertResult.diagnosticCommands || null,
      issueType: insertResult.issueType || null,
      environment: insertResult.environment || null,
      confidence: insertResult.confidence || null,
      createdAt: new Date(),
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async getAnalysisResults(limit = 10): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      id,
      sessionId: insertMessage.sessionId,
      message: insertMessage.message,
      isUser: insertMessage.isUser ?? false,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
