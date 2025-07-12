# AI Support Troubleshooter

## Overview

This is a full-stack web application that provides AI-powered technical support and troubleshooting assistance. The application analyzes error messages, logs, and technical issues using OpenAI's GPT-4 model to provide structured solutions, diagnostic commands, and similar issue recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Python 3.11 with Flask web framework
- **Language**: Python with type hints
- **API Integration**: Google Gemini AI for AI-powered analysis (free tier)
- **Session Management**: In-memory storage for development
- **CORS**: Flask-CORS for cross-origin requests
- **Port Configuration**: Flask server runs on port 5001

### Database & Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Migration System**: Drizzle Kit for schema migrations
- **Current Storage**: In-memory storage implementation (MemStorage) for development
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Data Models
- **Users**: Authentication and user management
- **Tickets**: Support ticket tracking with similarity scoring
- **Analysis Results**: AI analysis results with confidence scoring
- **Chat Messages**: Real-time chat functionality with session management

### Frontend Components
- **Analysis Panel**: Main interface for submitting issues and viewing AI analysis
- **Chat Sidebar**: Real-time chat interface for interactive support
- **Similar Tickets**: Component showing related past issues
- **Header**: Navigation and branding

### API Endpoints
- `POST /api/analyze`: Submit issues for AI analysis
- `GET/POST /api/chat`: Chat message handling
- Various CRUD operations for tickets and analysis results

## Data Flow

1. **Issue Submission**: User submits error logs or technical issues through the Analysis Panel
2. **AI Processing**: Backend sends structured prompts to OpenAI GPT-4 for analysis
3. **Result Processing**: AI responses are parsed and stored with confidence scores
4. **Similar Ticket Matching**: System searches for related past issues
5. **Real-time Chat**: Users can engage in follow-up conversations via chat sidebar
6. **Result Display**: Structured solutions, diagnostic commands, and recommendations are presented

## External Dependencies

### Production Dependencies
- **OpenAI API**: GPT-4 integration for AI analysis (requires OPENAI_API_KEY)
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Radix UI**: Component primitives for accessible UI
- **TanStack Query**: Server state management and caching

### Development Dependencies
- **Vite**: Development server and build system
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `/dist/public`
- **Backend**: ESBuild bundles Node.js server to `/dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **Development**: `npm run dev` - runs TypeScript server directly with tsx
- **Production**: `npm run build && npm start` - builds and runs bundled application
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **AI Integration**: Requires `OPENAI_API_KEY` or `VITE_OPENAI_API_KEY` environment variable

### Deployment Considerations
- Application expects PostgreSQL database to be provisioned
- OpenAI API key must be configured for AI functionality
- Static assets served from `/dist/public` in production
- Server-side rendering not implemented (SPA architecture)

The application follows a modern monorepo structure with shared TypeScript schemas, clean separation of concerns, and production-ready build configuration.

## Recent Changes

### January 12, 2025
- **README Documentation**: Created comprehensive README.md with full project documentation
- **Button Functionality Fix**: Resolved all non-functional buttons in header navigation and analysis panel
- **Cross-Component Communication**: Implemented custom event system for seamless UI interaction between header, FAQ sidebar, and analysis panel
- **File Upload Integration**: Connected analysis panel and FAQ sidebar upload functionality
- **Console Logging**: Added debugging capabilities for all interactive elements - verified working via console logs
- **Header Navigation**: All header buttons (Knowledge Base, History, Settings, Notifications) now functional
- **Upload Log**: Both analysis panel and FAQ sidebar upload buttons work together seamlessly

### Previous Updates
- Migrated from Python Flask to Node.js backend with Google Gemini AI integration
- Implemented permanent FAQ sidebar as always-visible left panel per user request
- Fixed analysis results display issues and data structure consistency
- Enhanced user interface with functional navigation throughout application
- Added real-time chat functionality with session management