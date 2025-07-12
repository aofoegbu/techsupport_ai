import { useState, useRef } from "react";
import { ChevronDown, ChevronRight, HelpCircle, MessageSquare, Search, Lightbulb, BookOpen, History, Settings, Bell, Zap, Database, Download, RefreshCw, Upload, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "How does the AI analysis work?",
    answer: "The AI analyzes your error logs, stack traces, and technical issues using Google's Gemini model. It identifies the root cause, suggests solutions, and provides diagnostic commands to help resolve the problem.",
    category: "Analysis"
  },
  {
    id: "2",
    question: "What types of issues can I analyze?",
    answer: "You can analyze database errors, network issues, application crashes, performance problems, API failures, configuration errors, and most technical logs or error messages.",
    category: "Analysis"
  },
  {
    id: "3",
    question: "How do I use the chat feature?",
    answer: "Click on the chat sidebar to start a conversation with the AI assistant. You can ask follow-up questions about your analysis results or get general troubleshooting help.",
    category: "Chat"
  },
  {
    id: "4",
    question: "What are similar tickets?",
    answer: "Similar tickets show previously resolved issues that match your current problem. They help you see how similar problems were solved in the past.",
    category: "Features"
  },
  {
    id: "5",
    question: "Can I copy diagnostic commands?",
    answer: "Yes! Click the copy button next to any diagnostic command to copy it to your clipboard. You can then run these commands in your terminal or command prompt.",
    category: "Features"
  },
  {
    id: "6",
    question: "How accurate is the AI analysis?",
    answer: "The AI provides a confidence score with each analysis. Higher scores indicate more certainty. Always verify suggestions in a safe environment before applying to production systems.",
    category: "Analysis"
  },
  {
    id: "7",
    question: "What should I include in my error submission?",
    answer: "Include the full error message, relevant stack trace, any error codes, the environment where it occurred, and steps that led to the error. More context leads to better analysis.",
    category: "Best Practices"
  },
  {
    id: "8",
    question: "Is my data secure?",
    answer: "Your data is processed through Google's Gemini API with standard security measures. Only submit non-sensitive information and avoid including passwords, API keys, or personal data.",
    category: "Security"
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQSidebar() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<string>("faq");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const handleKnowledgeBase = () => {
    // Open knowledge base with common troubleshooting guides
    setActiveSection("knowledge");
  };

  const handleHistory = () => {
    // Show analysis history
    setActiveSection("history");
  };

  const handleSettings = () => {
    // Open settings panel
    setActiveSection("settings");
  };

  const handleNotifications = () => {
    // Show notifications
    setActiveSection("notifications");
  };

  const uploadLog = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Auto-fill the analysis panel with uploaded log content
        const analysisPanel = document.querySelector('textarea[placeholder*="Paste your error"]') as HTMLTextAreaElement;
        if (analysisPanel) {
          analysisPanel.value = content;
          analysisPanel.dispatchEvent(new Event('input', { bubbles: true }));
        }
        alert(`Log file "${file.name}" uploaded successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const checkSystemHealth = () => {
    setActiveSection("system-health");
  };

  const generateIncidentReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      incident: "System Analysis Report",
      severity: "Medium",
      status: "Investigating",
      description: "Automated incident report generated from AI analysis",
      recommendations: [
        "Monitor system resources",
        "Check error logs for patterns",
        "Verify database connectivity"
      ]
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Incident report generated and downloaded!');
  };

  const escalateToL2 = () => {
    setActiveSection("escalation");
  };

  const scheduleMaintenance = () => {
    setActiveSection("maintenance");
  };

  const refreshData = () => {
    window.location.reload();
  };

  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Analysis": return <Search className="h-4 w-4" />;
      case "Chat": return <MessageSquare className="h-4 w-4" />;
      case "Features": return <Lightbulb className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "knowledge":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Knowledge Base</h3>
            <div className="space-y-3">
              <Card className="p-3">
                <h4 className="font-medium mb-2">Database Issues</h4>
                <p className="text-sm text-muted-foreground">Common database connection problems and solutions</p>
              </Card>
              <Card className="p-3">
                <h4 className="font-medium mb-2">Network Troubleshooting</h4>
                <p className="text-sm text-muted-foreground">Network connectivity and timeout issues</p>
              </Card>
              <Card className="p-3">
                <h4 className="font-medium mb-2">Application Errors</h4>
                <p className="text-sm text-muted-foreground">Common application runtime errors</p>
              </Card>
            </div>
          </div>
        );
      case "history":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Analysis History</h3>
            <div className="space-y-2">
              <Card className="p-3">
                <div className="text-sm">
                  <p className="font-medium">Database timeout error</p>
                  <p className="text-muted-foreground">2 hours ago</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-sm">
                  <p className="font-medium">Connection pool exhausted</p>
                  <p className="text-muted-foreground">1 day ago</p>
                </div>
              </Card>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>Auto</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Analysis Detail Level</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>Basic</option>
                  <option>Detailed</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="space-y-2">
              <Card className="p-3 border-l-4 border-green-500">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <p className="font-medium">System Health Check Passed</p>
                  </div>
                  <p className="text-muted-foreground">2 minutes ago</p>
                </div>
              </Card>
              <Card className="p-3 border-l-4 border-blue-500">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <p className="font-medium">New similar ticket found</p>
                  </div>
                  <p className="text-muted-foreground">10 minutes ago</p>
                </div>
              </Card>
              <Card className="p-3 border-l-4 border-yellow-500">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <p className="font-medium">Scheduled maintenance reminder</p>
                  </div>
                  <p className="text-muted-foreground">1 hour ago</p>
                </div>
              </Card>
            </div>
          </div>
        );
      case "system-health":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">System Health</h3>
            <div className="space-y-3">
              <Card className="p-3 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-green-600 font-bold">125ms</span>
                </div>
              </Card>
              <Card className="p-3 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Connections</span>
                  <span className="text-green-600 font-bold">Normal</span>
                </div>
              </Card>
              <Card className="p-3 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-yellow-600 font-bold">78%</span>
                </div>
              </Card>
              <Card className="p-3 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-green-600 font-bold">0.02%</span>
                </div>
              </Card>
            </div>
          </div>
        );
      case "escalation":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">L2 Support Escalation</h3>
            <div className="space-y-3">
              <Card className="p-3">
                <h4 className="font-medium mb-2">Escalation Criteria Met</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• High severity issue detected</li>
                  <li>• Multiple failed resolution attempts</li>
                  <li>• Customer impact assessment: Medium</li>
                </ul>
              </Card>
              <Button className="w-full" onClick={() => alert('Escalation request sent to L2 Support team!')}>
                <Zap className="h-4 w-4 mr-2" />
                Send Escalation Request
              </Button>
            </div>
          </div>
        );
      case "maintenance":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Maintenance Scheduler</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Maintenance Type</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>Database Maintenance</option>
                  <option>System Updates</option>
                  <option>Security Patches</option>
                  <option>Performance Optimization</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Scheduled Time</label>
                <input type="datetime-local" className="w-full mt-1 p-2 border rounded" />
              </div>
              <Button className="w-full" onClick={() => alert('Maintenance scheduled successfully!')}>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Category:
              </label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Collapsible
                  key={faq.id}
                  open={openItems.has(faq.id)}
                  onOpenChange={() => toggleItem(faq.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(faq.category)}
                      <span className="text-sm font-medium">{faq.question}</span>
                    </div>
                    {openItems.has(faq.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".log,.txt,.json"
        style={{ display: 'none' }}
      />
      <Card className="border-0 rounded-none flex-1">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support Center
          </CardTitle>
          
          {/* Navigation Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant={activeSection === "faq" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("faq")}
              className="text-xs"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              FAQ
            </Button>
            <Button
              variant={activeSection === "knowledge" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("knowledge")}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Knowledge
            </Button>
            <Button
              variant={activeSection === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("history")}
              className="text-xs"
            >
              <History className="h-3 w-3 mr-1" />
              History
            </Button>
            <Button
              variant={activeSection === "settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("settings")}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
          
          <Button
            variant={activeSection === "notifications" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection("notifications")}
            className="text-xs w-full mt-2"
          >
            <Bell className="h-3 w-3 mr-1" />
            Notifications
          </Button>
          
          <Separator className="my-3" />
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="justify-start text-xs">
                <Upload className="h-3 w-3 mr-2" />
                Upload Log
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveSection("system-health")} className="justify-start text-xs">
                <Search className="h-3 w-3 mr-2" />
                Check System Health
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const reportData = {
                  timestamp: new Date().toISOString(),
                  incident: "System Analysis Report",
                  severity: "Medium",
                  status: "Investigating",
                  description: "Automated incident report generated from AI analysis"
                };
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `incident-report-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                alert('Incident report generated and downloaded!');
              }} className="justify-start text-xs">
                <Download className="h-3 w-3 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveSection("escalation")} className="justify-start text-xs">
                <Zap className="h-3 w-3 mr-2" />
                Escalate to L2
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveSection("maintenance")} className="justify-start text-xs">
                <Database className="h-3 w-3 mr-2" />
                Schedule Maintenance
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="justify-start text-xs">
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}