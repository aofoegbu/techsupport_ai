import { useState } from "react";
import Header from "@/components/header";
import AnalysisPanel from "@/components/analysis-panel";
import ChatSidebar from "@/components/chat-sidebar";
import FAQSidebar from "@/components/faq-sidebar";

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const handleHeaderSectionChange = (section: string) => {
    console.log('Dashboard handling section change:', section);
    // Dispatch custom event to FAQ sidebar
    const event = new CustomEvent('faq-section-change', { detail: section });
    window.dispatchEvent(event);
  };

  const handleHeaderNotificationClick = () => {
    console.log('Dashboard handling notification click');
    // Dispatch custom event to FAQ sidebar
    const event = new CustomEvent('faq-section-change', { detail: 'notifications' });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSectionChange={handleHeaderSectionChange}
        onNotificationClick={handleHeaderNotificationClick}
      />
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
