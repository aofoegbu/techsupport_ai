import { useState } from "react";
import Header from "@/components/header";
import AnalysisPanel from "@/components/analysis-panel";
import ChatSidebar from "@/components/chat-sidebar";
import FAQSidebar from "@/components/faq-sidebar";

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <div className="min-h-screen bg-background-alt flex">
      <div className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 flex">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
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
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowFAQ(false)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          !showFAQ 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => setShowFAQ(true)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          showFAQ 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        FAQ
                      </button>
                    </div>
                    
                    {showFAQ ? (
                      <FAQSidebar />
                    ) : (
                      <ChatSidebar sessionId={sessionId} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
