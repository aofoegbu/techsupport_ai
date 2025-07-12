import { useState } from "react";
import Header from "@/components/header";
import AnalysisPanel from "@/components/analysis-panel";
import ChatSidebar from "@/components/chat-sidebar";

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  return (
    <div className="min-h-screen bg-background-alt">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <AnalysisPanel 
              analysisResults={analysisResults}
              setAnalysisResults={setAnalysisResults}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ChatSidebar sessionId={sessionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
