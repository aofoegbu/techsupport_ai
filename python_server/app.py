from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# In-memory storage classes
class MemoryStorage:
    def __init__(self):
        self.users: Dict[int, Dict] = {}
        self.tickets: Dict[int, Dict] = {}
        self.analysis_results: Dict[int, Dict] = {}
        self.chat_messages: Dict[int, Dict] = {}
        self.current_user_id = 1
        self.current_ticket_id = 1
        self.current_analysis_id = 1
        self.current_chat_id = 1
        
        self._seed_data()
    
    def _seed_data(self):
        """Seed sample tickets for similarity matching"""
        sample_tickets = [
            {
                "ticketNumber": "TICKET-2847",
                "title": "Database connection timeout in production",
                "description": "Similar connection pool exhaustion issue resolved by increasing max pool size from 20 to 50 connections.",
                "status": "resolved",
                "priority": "high",
                "assignedTo": "Sarah Chen",
                "resolvedBy": "Sarah Chen",
                "environment": "production",
                "issueType": "database",
                "similarity": 95,
                "resolution": "Increased connection pool size and implemented connection leak detection"
            },
            {
                "ticketNumber": "TICKET-2791",
                "title": "Spring Boot DataSource connection failures",
                "description": "Connection leak in transaction management caused similar timeout errors.",
                "status": "resolved",
                "priority": "medium",
                "assignedTo": "Mike Rodriguez",
                "resolvedBy": "Mike Rodriguez",
                "environment": "production",
                "issueType": "application",
                "similarity": 87,
                "resolution": "Fixed transaction management to properly close connections"
            },
            {
                "ticketNumber": "TICKET-2756",
                "title": "MySQL connection pool exhaustion",
                "description": "High load causing database connection timeouts during peak hours.",
                "status": "resolved",
                "priority": "high",
                "assignedTo": "Jennifer Liu",
                "resolvedBy": "Jennifer Liu",
                "environment": "production",
                "issueType": "database",
                "similarity": 78,
                "resolution": "Optimized queries and implemented connection pooling best practices"
            }
        ]
        
        for ticket in sample_tickets:
            self.create_ticket(ticket)
    
    def create_ticket(self, ticket_data: Dict) -> Dict:
        """Create a new ticket"""
        ticket_id = self.current_ticket_id
        self.current_ticket_id += 1
        
        ticket = {
            "id": ticket_id,
            "ticketNumber": ticket_data["ticketNumber"],
            "title": ticket_data["title"],
            "description": ticket_data["description"],
            "status": ticket_data.get("status", "open"),
            "priority": ticket_data.get("priority", "medium"),
            "assignedTo": ticket_data.get("assignedTo"),
            "resolvedBy": ticket_data.get("resolvedBy"),
            "environment": ticket_data.get("environment"),
            "issueType": ticket_data.get("issueType"),
            "similarity": ticket_data.get("similarity"),
            "resolution": ticket_data.get("resolution"),
            "createdAt": datetime.now().isoformat(),
            "resolvedAt": datetime.now().isoformat() if ticket_data.get("status") == "resolved" else None
        }
        
        self.tickets[ticket_id] = ticket
        return ticket
    
    def get_all_tickets(self) -> List[Dict]:
        """Get all tickets sorted by creation date"""
        tickets = list(self.tickets.values())
        tickets.sort(key=lambda x: x["createdAt"], reverse=True)
        return tickets
    
    def search_similar_tickets(self, query: str, limit: int = 3) -> List[Dict]:
        """Search for similar resolved tickets"""
        tickets = list(self.tickets.values())
        query_lower = query.lower()
        
        # Simple similarity matching based on keywords
        similar_tickets = []
        for ticket in tickets:
            if (ticket["status"] == "resolved" and 
                ("database" in ticket["title"].lower() or 
                 "connection" in ticket["title"].lower() or
                 "timeout" in ticket["description"].lower() or
                 "pool" in ticket["description"].lower())):
                similar_tickets.append(ticket)
        
        # Sort by similarity score and limit results
        similar_tickets.sort(key=lambda x: x.get("similarity", 0), reverse=True)
        return similar_tickets[:limit]
    
    def create_analysis_result(self, result_data: Dict) -> Dict:
        """Create a new analysis result"""
        result_id = self.current_analysis_id
        self.current_analysis_id += 1
        
        result = {
            "id": result_id,
            "inputText": result_data["inputText"],
            "rootCause": result_data.get("rootCause"),
            "solutions": result_data.get("solutions"),
            "diagnosticCommands": result_data.get("diagnosticCommands"),
            "issueType": result_data.get("issueType"),
            "environment": result_data.get("environment"),
            "confidence": result_data.get("confidence"),
            "createdAt": datetime.now().isoformat()
        }
        
        self.analysis_results[result_id] = result
        return result
    
    def get_chat_messages(self, session_id: str) -> List[Dict]:
        """Get chat messages for a session"""
        messages = [msg for msg in self.chat_messages.values() 
                   if msg["sessionId"] == session_id]
        messages.sort(key=lambda x: x["timestamp"])
        return messages
    
    def create_chat_message(self, message_data: Dict) -> Dict:
        """Create a new chat message"""
        message_id = self.current_chat_id
        self.current_chat_id += 1
        
        message = {
            "id": message_id,
            "sessionId": message_data["sessionId"],
            "message": message_data["message"],
            "isUser": message_data.get("isUser", False),
            "timestamp": datetime.now().isoformat()
        }
        
        self.chat_messages[message_id] = message
        return message

# Initialize storage
storage = MemoryStorage()

# Gemini AI functions
def analyze_issue(input_text: str, issue_type: str = None, environment: str = None) -> Dict:
    """Analyze technical issue using Gemini AI"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert support engineer AI assistant. Analyze the provided error message, log, or technical issue and provide a structured response in JSON format.

        Your response should include:
        1. rootCause: A clear explanation of what's causing the issue
        2. solutions: An array of recommended solutions with title and description
        3. diagnosticCommands: An array of useful diagnostic commands with description and command
        4. issueType: The type of issue (database, network, application, performance, etc.)
        5. confidence: A confidence score from 1-100

        Be specific, actionable, and professional in your recommendations.

        Analyze this technical issue:
        Input: {input_text}
        Issue Type: {issue_type or "Auto-detect"}
        Environment: {environment or "Not specified"}

        Provide analysis in JSON format only, no additional text.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            analysis_data = json.loads(response.text)
            return analysis_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "rootCause": "Unable to parse AI response",
                "solutions": [{"title": "Manual Analysis", "description": "Please analyze the issue manually"}],
                "diagnosticCommands": [{"description": "Check logs", "command": "tail -f /var/log/application.log"}],
                "issueType": issue_type or "unknown",
                "confidence": 50
            }
    
    except Exception as e:
        raise Exception(f"Failed to analyze issue: {str(e)}")

def generate_chat_response(messages: List[Dict]) -> str:
    """Generate chat response using Gemini AI"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convert messages to conversation format
        conversation = ""
        for msg in messages:
            if msg["role"] != "system":
                role = "Human" if msg["role"] == "user" else "Assistant"
                conversation += f"{role}: {msg['content']}\n"
        
        prompt = f"""
        You are an AI support assistant helping with technical troubleshooting. 
        Provide helpful, concise, and actionable responses to technical questions. 
        If asked for diagnostic commands, provide them in a clear format.
        Keep responses focused and professional.

        Conversation:
        {conversation}

        Assistant:"""
        
        response = model.generate_content(prompt)
        return response.text or "I'm having trouble responding right now."
    
    except Exception as e:
        raise Exception(f"Failed to generate chat response: {str(e)}")

# API Routes
@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze technical issue"""
    try:
        data = request.get_json()
        input_text = data.get('inputText')
        
        if not input_text:
            return jsonify({"message": "Input text is required"}), 400
        
        issue_type = data.get('issueType')
        environment = data.get('environment')
        
        # Analyze the issue
        analysis_data = analyze_issue(input_text, issue_type, environment)
        
        # Store the analysis result
        analysis_result = storage.create_analysis_result({
            "inputText": input_text,
            "rootCause": analysis_data.get("rootCause"),
            "solutions": analysis_data.get("solutions"),
            "diagnosticCommands": analysis_data.get("diagnosticCommands"),
            "issueType": analysis_data.get("issueType"),
            "environment": environment,
            "confidence": analysis_data.get("confidence")
        })
        
        # Get similar tickets
        similar_tickets = storage.search_similar_tickets(input_text, 3)
        
        return jsonify({
            "analysis": analysis_result,
            "similarTickets": similar_tickets
        })
    
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({
            "message": "Failed to analyze issue. Please check your Gemini API key and try again."
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        message = data.get('message')
        session_id = data.get('sessionId')
        
        if not message or not session_id:
            return jsonify({"message": "Message and session ID are required"}), 400
        
        # Store user message
        storage.create_chat_message({
            "sessionId": session_id,
            "message": message,
            "isUser": True
        })
        
        # Get chat history for context
        chat_history = storage.get_chat_messages(session_id)
        
        # Prepare messages for AI
        messages = [
            {"role": "system", "content": "system"},
            *[{
                "role": "user" if msg["isUser"] else "assistant",
                "content": msg["message"]
            } for msg in chat_history[-10:]],  # Last 10 messages
            {"role": "user", "content": message}
        ]
        
        # Generate AI response
        ai_response = generate_chat_response(messages)
        
        # Store AI response
        ai_message = storage.create_chat_message({
            "sessionId": session_id,
            "message": ai_response,
            "isUser": False
        })
        
        return jsonify({"message": ai_message})
    
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "message": "Failed to process chat message. Please try again."
        }), 500

@app.route('/api/chat/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    """Get chat history for a session"""
    try:
        messages = storage.get_chat_messages(session_id)
        return jsonify({"messages": messages})
    except Exception as e:
        print(f"Chat history error: {e}")
        return jsonify({"message": "Failed to fetch chat history"}), 500

@app.route('/api/tickets/similar', methods=['GET'])
def get_similar_tickets():
    """Get similar tickets"""
    try:
        query = request.args.get('query', '')
        limit = int(request.args.get('limit', 3))
        
        tickets = storage.search_similar_tickets(query, limit)
        return jsonify({"tickets": tickets})
    except Exception as e:
        print(f"Similar tickets error: {e}")
        return jsonify({"message": "Failed to fetch similar tickets"}), 500

@app.route('/api/tickets', methods=['GET'])
def get_all_tickets():
    """Get all tickets"""
    try:
        tickets = storage.get_all_tickets()
        return jsonify({"tickets": tickets})
    except Exception as e:
        print(f"Tickets error: {e}")
        return jsonify({"message": "Failed to fetch tickets"}), 500

# Serve frontend in development
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend files (development only)"""
    if path and os.path.exists(f"client/dist/{path}"):
        return send_from_directory("client/dist", path)
    return send_from_directory("client/dist", "index.html")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)