
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Send, Loader2, ChevronUp, ChevronDown, Zap, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentContext {
  id?: string;
  title?: string;
  content?: string;
  type?: string;
  metadata?: any;
}

interface AIAssistantSidebarProps {
  documentContext?: DocumentContext;
  document?: any; // Legacy prop for backward compatibility
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void; // Legacy prop for backward compatibility
  className?: string;
  fullPage?: boolean; // New prop for full-page mode
  sessionId?: string; // Session ID for conversation persistence
  userId?: string; // User ID for analytics and memory
}

const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({
  documentContext,
  document, // Legacy prop
  isOpen = true,
  onToggle,
  onClose,
  className = '',
  fullPage = false,
  sessionId,
  userId
}) => {
  // Convert legacy document prop to documentContext if needed
  const activeContext = documentContext || (document ? {
    id: document.id,
    title: document.title,
    content: document.content,
    type: document.content_type || 'document',
    metadata: document.metadata
  } : undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callChaldionAPI = async (prompt: string, documentContext?: DocumentContext) => {
    try {
      const { data, error } = await supabase.functions.invoke('grand-strategist', {
        body: {
          prompt,
          documentContext,
          sessionId: sessionId || 'default-session',
          documentId: activeContext?.id,
          userId: userId
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data.response;
    } catch (error) {
      console.error('Chaldion API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callChaldionAPI(userMessage.content, activeContext);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "Chaldion Analysis Complete",
        description: "Strategic insights provided",
      });
      
    } catch (error: any) {
      console.error('Error calling Chaldion:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "Well now, seems we hit a snag there. The strategic intelligence network is having some trouble. Let me regroup and we'll try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Strategic Network Error",
        description: error.message || "Failed to connect to Chaldion AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Analyze this document strategically",
    "What are the key risks here?", 
    "Identify opportunities for advantage",
    "Provide tactical recommendations",
    "Strategic overview needed"
  ];

  if (!isOpen) return null;

  // Full page mode renders differently
  if (fullPage) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <Brain className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to Chaldion</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Your strategic intelligence partner. I have complete knowledge of your documents and conversations. 
                  Ask me anything about strategy, analysis, or tactical guidance.
                </p>
                
                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => setInput(prompt)}
                      disabled={isLoading}
                    >
                      <Zap className="h-4 w-4 mr-3 text-primary" />
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border text-card-foreground'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  <div
                    className={`text-xs mt-3 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg p-4 flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Chaldion is analyzing your request...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex space-x-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Chaldion anything about your strategy, documents, or objectives..."
                className="flex-1 min-h-[60px] resize-none bg-background"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="lg"
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular sidebar mode
  return (
    <Card className={`w-96 h-full flex flex-col border-l-0 rounded-l-none bg-gradient-to-b from-slate-50 to-slate-100 shadow-xl ${className}`}>
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white cursor-pointer hover:from-slate-700 hover:to-slate-800 transition-all">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-400" />
                <span>Chaldion AI</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  Grand Strategist
                </Badge>
              </div>
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
            {/* Context Display */}
            {activeContext && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="text-sm text-blue-800 font-medium">Document Context</div>
                <div className="text-xs text-blue-600 mt-1">
                  {activeContext.title} ({activeContext.type})
                </div>
              </div>
            )}

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-sm font-medium">Chaldion Ready for Strategic Consultation</p>
                    <p className="text-xs mt-1">Ask about strategic analysis, risks, or opportunities</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-slate-600">Chaldion analyzing...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <div className="text-xs font-medium text-slate-600 mb-2">Quick Strategic Queries:</div>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-white hover:bg-blue-50"
                    onClick={() => setInput(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex space-x-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Chaldion for strategic analysis..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AIAssistantSidebar;
