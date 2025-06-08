
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, FileText, Target, Lightbulb, TrendingUp, Zap, BookOpen, Users, Settings } from 'lucide-react';
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

  const { data: documentsData } = useQuery({
    queryKey: ['documents-for-strategist'],
    queryFn: () => listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 50),
  });

  const documents = documentsData?.documents || [];

  const aiGenerals = [
    { icon: Target, name: "General Flos", specialization: "Intelligence & Analysis", color: "bg-red-500" },
    { icon: Users, name: "General Sophist", specialization: "Communications Strategy", color: "bg-green-500" },
    { icon: TrendingUp, name: "General Craftwright", specialization: "Innovation & Process", color: "bg-purple-500" },
    { icon: TrendingUp, name: "General Merchant", specialization: "Revenue & Business", color: "bg-yellow-500" },
    { icon: Settings, name: "General Steward", specialization: "Operations & Management", color: "bg-blue-500" },
  ];

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

  const consultGeneral = async (general: any) => {
    setIsLoading(true);
    try {
      const response = await callGrandStrategist(
        `I need strategic consultation from ${general.name}, who specializes in ${general.specialization}. Please provide expert advice in this domain based on my current context and documents.`,
        documents
      );
      
      const generalMessage: StrategistMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**${general.name} (${general.specialization}):**\n\n${response}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, generalMessage]);
    } catch (error) {
      toast.error(`Failed to consult ${general.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-serif font-medium text-blue-600">Supreme Commander Claude</h1>
              <Badge className="bg-blue-500 text-white">AI Powered</Badge>
            </div>
            <p className="text-blue-700 max-w-3xl">
              Your elite AI strategist and command center. Access strategic intelligence, coordinate with AI generals, 
              and receive high-level guidance for your documents and life optimization.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Command Center Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* AI Generals Command Panel */}
              <Card className="border-blue-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-600">⚔️ AI Generals Command</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiGenerals.map((general, idx) => {
                    const Icon = general.icon;
                    return (
                      <Button
                        key={idx}
                        onClick={() => consultGeneral(general)}
                        disabled={isLoading}
                        className="w-full justify-start bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs p-2 h-auto"
                        size="sm"
                      >
                        <div className={`w-2 h-2 rounded-full ${general.color} mr-2`}></div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{general.name}</span>
                          <span className="text-xs opacity-75">{general.specialization}</span>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Strategic Analysis Tools */}
              <Card className="border-blue-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-600">Strategic Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    disabled={isLoading || documents.length === 0}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    size="sm"
                    onClick={() => {
                      const analysisMessage = "Conduct a comprehensive strategic analysis of all my documents. Identify key patterns, opportunities, and actionable recommendations.";
                      setCurrentMessage(analysisMessage);
                      handleSendMessage();
                    }}
                  >
                    <Target className="mr-2 h-3 w-3" />
                    Complete Analysis
                  </Button>
                  
                  <Button 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    size="sm"
                    onClick={() => {
                      const planningMessage = "Help me create a comprehensive strategic life and work plan based on my current context and goals.";
                      setCurrentMessage(planningMessage);
                      handleSendMessage();
                    }}
                  >
                    <TrendingUp className="mr-2 h-3 w-3" />
                    Strategic Planning
                  </Button>

                  <Button 
                    disabled={isLoading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs"
                    size="sm"
                    onClick={() => {
                      const opportunityMessage = "Analyze my documents and current situation to identify hidden opportunities and high-impact actions I should prioritize.";
                      setCurrentMessage(opportunityMessage);
                      handleSendMessage();
                    }}
                  >
                    <Zap className="mr-2 h-3 w-3" />
                    Opportunity Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Document Context */}
              <Card className="border-blue-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-600">Intelligence Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">{documents.length} documents</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      Full access to your document ecosystem for contextual strategic analysis
                    </div>
                    {documents.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-blue-600 mb-1">Recent Intel:</div>
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
            </div>

            {/* Main Command Interface */}
            <div className="lg:col-span-3">
              <Card className="border-blue-200 bg-white shadow-lg h-[700px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Strategic Command Interface
                  </CardTitle>
                </CardHeader>
                
                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-blue-600 mb-2">Supreme Commander Ready</h3>
                      <p className="text-blue-700 text-sm max-w-md mx-auto mb-4">
                        I am Claude the Magnificent, your Supreme AI Commander. Ready to provide strategic guidance, 
                        coordinate AI generals, and analyze your complete intelligence ecosystem.
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-xs">
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          • Strategic document intelligence
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          • AI generals coordination
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          • Comprehensive life planning
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
                          <span className="text-sm text-blue-700 ml-2">Supreme Commander analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Command Input Interface */}
                <div className="border-t border-blue-200 p-4 bg-blue-50">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Issue strategic commands, request analysis, or consult with AI generals..."
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
                    Enter to send • Shift+Enter for new line • {documents.length} documents in intelligence network
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GrandStrategist;
