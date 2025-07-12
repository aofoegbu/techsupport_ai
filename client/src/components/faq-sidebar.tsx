import { useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle, MessageSquare, Search, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
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

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <Card className="border-0 rounded-none flex-1">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 overflow-y-auto">
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
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-start gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {openItems.has(faq.id) ? (
                      <ChevronDown className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(faq.category)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                          {faq.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-left">
                        {faq.question}
                      </p>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No FAQs found for this category.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}