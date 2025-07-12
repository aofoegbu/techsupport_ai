import { ExternalLink, User, Clock, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  similarity?: number;
}

interface SimilarTicketsProps {
  tickets: Ticket[];
}

export default function SimilarTickets({ tickets }: SimilarTicketsProps) {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zm-2-2H4v4h16V8zM4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4H4z"/>
          </svg>
          <span>Similar Past Issues</span>
          <Badge variant="secondary" className="text-xs">
            {tickets.length} matches found
          </Badge>
        </h3>

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-primary">
                      {ticket.ticketNumber}
                    </span>
                    <Badge 
                      className={
                        ticket.status === "resolved" 
                          ? "bg-success text-white" 
                          : "bg-warning text-white"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {ticket.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {ticket.resolvedBy && (
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Resolved by {ticket.resolvedBy}</span>
                      </span>
                    )}
                    
                    {ticket.resolvedAt && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(ticket.resolvedAt)}</span>
                      </span>
                    )}
                    
                    {ticket.similarity && (
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{ticket.similarity}% similarity</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700 p-1">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
