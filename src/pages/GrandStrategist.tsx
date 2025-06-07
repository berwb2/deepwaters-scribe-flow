
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, FileText, Target, Lightbulb, TrendingUp, Zap, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { listDocuments } from '@/lib/api';

interface StrategistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
        "Please analyze all my documents and provide strategic insights, patterns, and recommendations for my life and work. Focus on identifying key themes, strategic opportunities, and actionable next steps.",
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
        "Based on my documents and context, help me create a comprehensive strategic life plan. Guide me through identifying my goals, values, and creating actionable roadmaps that connect my current situation to my desired future.",
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

  const identifyOpportunities = async () => {
    setIsLoading(true);
    try {
      const response = await callGrandStrategist(
        "Analyze my documents to identify hidden strategic opportunities, potential synergies between different areas of my life/work, and recommend high-impact actions I should prioritize.",
        documents
      );
      
      const opportunityMessage: StrategistMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, opportunityMessage]);
    } catch (error) {
      toast.error('Failed to identify opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-serif font-medium text-blue-600">Grand Strategist</h1>
            <Badge className="bg-blue-500 text-white">AI Powered</Badge>
          </div>
          <p className="text-blue-700 max-w-3xl">
            Your elite AI advisor for strategic thinking, life optimization, and document intelligence. 
            I analyze your entire document ecosystem to provide high-level strategic insights and actionable guidance.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Enhanced Analysis Tools Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">Strategic Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={analyzeAllDocuments}
                  disabled={isLoading || documents.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                  size="sm"
                >
                  <Target className="mr-2 h-3 w-3" />
                  Complete Document Analysis
                </Button>
                
                <Button 
                  onClick={startStrategicPlanning}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  size="sm"
                >
                  <TrendingUp className="mr-2 h-3 w-3" />
                  Strategic Life Planning
                </Button>

                <Button 
                  onClick={identifyOpportunities}
                  disabled={isLoading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs"
                  size="sm"
                >
                  <Zap className="mr-2 h-3 w-3" />
                  Opportunity Identification
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">Document Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{documents.length} documents</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    The Grand Strategist has full access to your document ecosystem for contextual strategic analysis
                  </div>
                  {documents.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-blue-600 mb-1">Recent Documents:</div>
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="text-xs text-blue-500 truncate">
                          • {doc.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-blue-700">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-3 w-3 mt-0.5 text-blue-500" />
                    <span>Ask specific strategic questions about your life, work, or goals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="h-3 w-3 mt-0.5 text-blue-500" />
                    <span>Request document analysis to find patterns and opportunities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 mt-0.5 text-blue-500" />
                    <span>Get help creating strategic plans and roadmaps</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="border-blue-200 bg-white shadow-lg h-[700px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Strategic Consultation Interface
                </CardTitle>
              </CardHeader>
              
              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-600 mb-2">Grand Strategist Ready</h3>
                    <p className="text-blue-700 text-sm max-w-md mx-auto mb-4">
                      I'm your elite AI strategist, ready to analyze your documents and provide sophisticated strategic guidance.
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-xs">
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        • Strategic document analysis
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        • Life and business planning
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        • Opportunity identification
                      </Badge>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 border border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-blue-600'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-blue-700 ml-2">Grand Strategist analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Enhanced Input Area */}
              <div className="border-t border-blue-200 p-4 bg-blue-50">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask the Grand Strategist for strategic insights, document analysis, life planning guidance, or any strategic question..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1 min-h-[80px] border-blue-200 focus:border-blue-400 bg-white"
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
                    className="bg-blue-500 hover:bg-blue-600 text-white h-[80px]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  Press Enter to send • Shift+Enter for new line • {documents.length} documents in context
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GrandStrategist;
