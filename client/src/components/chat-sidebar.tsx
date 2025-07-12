import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Bot, Zap, FileText, ArrowUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatSidebarProps {
  sessionId: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatSidebar({ sessionId }: ChatSidebarProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat history
  const { data: chatData } = useQuery({
    queryKey: ["/api/chat", sessionId],
    enabled: !!sessionId,
  });

  const messages: ChatMessage[] = chatData?.messages || [];

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      // Invalidate and refetch chat messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      sessionId,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial AI greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && sessionId) {
      sendMessageMutation.mutate({
        message: "Hello! I'm your AI support assistant. I've analyzed your database connection error. Would you like me to generate specific monitoring queries for your environment?",
        sessionId,
      });
    }
  }, [sessionId]);

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-4">
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-secondary flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span>AI Assistant</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">Ask follow-up questions</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.isUser ? "justify-end" : ""
              }`}
            >
              {!msg.isUser && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}

              <div
                className={`rounded-lg p-3 text-sm max-w-xs ${
                  msg.isUser
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(msg.timestamp)}
                </div>
              </div>

              {msg.isUser && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">SE</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Ask a follow-up question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="sm"
              className="bg-primary hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">AI is online</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-secondary mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-warning" />
            <span>Quick Actions</span>
          </h4>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 text-success mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21Z"/>
              </svg>
              Check System Health
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 text-primary mr-2" />
              Generate Incident Report
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowUp className="w-4 h-4 text-accent mr-2" />
              Escalate to L2 Support
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 text-warning mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
