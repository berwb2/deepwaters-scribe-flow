
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, FileText, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { listDocuments } from '@/lib/api';

interface StrategistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentInsight {
  id: string;
  title: string;
  content_type: string;
  strategic_value: 'high' | 'medium' | 'low';
  key_insights: string[];
  recommendations: string[];
}

const GrandStrategist = () => {
  const [messages, setMessages] = useState<StrategistMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'chat' | 'analysis' | 'planning'>('chat');

  // Fetch user documents for context
  const { data: documentsData } = useQuery({
    queryKey: ['documents-for-strategist'],
    queryFn: () => listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 50),
  });

  const documents = documentsData?.documents || [];

  const callGrandStrategist = async (userMessage: string, documentContext: any[] = []) => {
    try {
      const { data, error } = await supabase.functions.invoke('grand-strategist', {
        body: {
          message: userMessage,
          documents: documentContext,
          analysis_mode: analysisMode
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Grand Strategist API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: StrategistMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await callGrandStrategist(currentMessage, documents);
      
      const assistantMessage: StrategistMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response from Grand Strategist');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAllDocuments = async () => {
    if (documents.length === 0) {
      toast.error('No documents found to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const response = await callGrandStrategist(
        "Please analyze all my documents and provide strategic insights, patterns, and recommendations for my life and work.",
        documents
      );
      
      const analysisMessage: StrategistMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      toast.error('Failed to analyze documents');
    } finally {
      setIsLoading(false);
    }
  };

  const startStrategicPlanning = async () => {
    setIsLoading(true);
    try {
      const response = await callGrandStrategist(
        "Based on my documents and context, help me create a comprehensive strategic life plan. Guide me through identifying my goals, values, and creating actionable roadmaps.",
        documents
      );
      
      const planningMessage: StrategistMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, planningMessage]);
    } catch (error) {
      toast.error('Failed to start strategic planning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-serif font-medium text-blue-600">Grand Strategist</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your elite AI advisor for strategic thinking, life optimization, and document intelligence. 
            I analyze your documents to provide high-level strategic insights and actionable guidance.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Analysis Tools Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">Quick Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={analyzeAllDocuments}
                  disabled={isLoading || documents.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                  size="sm"
                >
                  <Target className="mr-2 h-3 w-3" />
                  Analyze All Documents
                </Button>
                
                <Button 
                  onClick={startStrategicPlanning}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  size="sm"
                >
                  <TrendingUp className="mr-2 h-3 w-3" />
                  Strategic Planning
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">Document Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{documents.length} documents</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    The strategist has access to all your documents for contextual analysis
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="border-blue-100 h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-blue-700">Strategic Consultation</CardTitle>
              </CardHeader>
              
              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-600 mb-2">Ready for Strategic Analysis</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Ask me to analyze your documents, create strategic plans, or provide guidance on any aspect of your life and work.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-muted-foreground ml-2">Grand Strategist is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask the Grand Strategist for strategic insights, document analysis, or life planning guidance..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1 min-h-[60px] border-blue-200 focus:border-blue-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GrandStrategist;
