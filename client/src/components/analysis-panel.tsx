import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Upload, AlertTriangle, Lightbulb, Terminal, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SimilarTickets from "@/components/similar-tickets";

interface AnalysisPanelProps {
  analysisResults: any;
  setAnalysisResults: (results: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function AnalysisPanel({ 
  analysisResults, 
  setAnalysisResults, 
  isAnalyzing, 
  setIsAnalyzing 
}: AnalysisPanelProps) {
  const [inputText, setInputText] = useState(`2024-01-15 14:23:17 ERROR [DatabaseConnection] Connection timeout after 30000ms
org.springframework.dao.DataAccessResourceFailureException: Failed to obtain JDBC Connection
    at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:82)
    at org.springframework.orm.hibernate5.HibernateTransactionManager.doBegin(HibernateTransactionManager.java:448)`);
  const [issueType, setIssueType] = useState("auto-detect");
  const [environment, setEnvironment] = useState("all");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: { inputText: string; issueType?: string; environment?: string }) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json();
    },
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Analysis Complete",
        description: "AI has successfully analyzed your issue.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an error message or log to analyze.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      inputText: inputText.trim(),
      issueType: issueType === "auto-detect" ? "" : issueType,
      environment: environment === "all" ? "" : environment,
    });
  };

  const copyToClipboard = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
      toast({
        title: "Copied!",
        description: "Command copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Issue Analysis</span>
            </h2>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Upload Log
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Error Message / System Logs
              </label>
              <Textarea
                placeholder="Paste your error message, stack trace, or system logs here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-32 font-mono text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Auto-detect Issue Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto-detect">Auto-detect Issue Type</SelectItem>
                    <SelectItem value="database">Database Error</SelectItem>
                    <SelectItem value="network">Network Issue</SelectItem>
                    <SelectItem value="application">Application Error</SelectItem>
                    <SelectItem value="performance">Performance Issue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21Z"/>
                    </svg>
                    Analyze Issue
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              <span>AI Analysis Results</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-xs text-gray-500">GPT-4 Analysis</span>
              </div>
            </h3>

            <div className="space-y-4">
              {/* Root Cause Analysis */}
              {analysisResults.analysis?.rootCause && (
                <div className="border-l-4 border-destructive bg-red-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-destructive mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Root Cause Identified</span>
                  </h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.analysis.rootCause}
                  </p>
                </div>
              )}

              {/* Recommended Solutions */}
              {analysisResults.analysis?.solutions && analysisResults.analysis.solutions.length > 0 && (
                <div className="border-l-4 border-success bg-green-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-success mb-3 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21Z"/>
                    </svg>
                    <span>Recommended Solutions</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResults.analysis.solutions.map((solution: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-success text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {solution.title || solution}
                          </p>
                          {solution.description && (
                            <p className="text-xs text-gray-600">{solution.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Commands */}
              {analysisResults.analysis?.diagnosticCommands && analysisResults.analysis.diagnosticCommands.length > 0 && (
                <div className="border-l-4 border-primary bg-blue-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-primary mb-3 flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Diagnostic Commands</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResults.analysis.diagnosticCommands.map((cmd: any, index: number) => (
                      <div key={index} className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">
                            {cmd.description || `Command ${index + 1}`}
                          </span>
                          <button
                            onClick={() => copyToClipboard(cmd.command || cmd, `cmd-${index}`)}
                            className="text-primary hover:text-blue-300 transition-colors"
                          >
                            {copiedCommand === `cmd-${index}` ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <code className="text-green-400">{cmd.command || cmd}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Tickets */}
      {analysisResults?.similarTickets && (
        <SimilarTickets tickets={analysisResults.similarTickets} />
      )}
    </div>
  );
}
