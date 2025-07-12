import { useState } from "react";
import Header from "@/components/header";
import AnalysisPanel from "@/components/analysis-panel";
import ChatSidebar from "@/components/chat-sidebar";
import FAQSidebar from "@/components/faq-sidebar";

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Left FAQ Panel - Always visible */}
        <div className="w-80 border-r bg-card/50 min-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4">
            <FAQSidebar />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalysisPanel
                  analysisResults={analysisResults}
                  setAnalysisResults={setAnalysisResults}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              </div>
              <div>
                <ChatSidebar sessionId={sessionId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
