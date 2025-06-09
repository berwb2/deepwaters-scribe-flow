
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Brain, X, Loader2 } from "lucide-react";
import { DocumentMeta } from '@/types/documents';
import { callGrandStrategist, getAllDocumentsForAI } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import AIResponseFormatter from './AIResponseFormatter';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantSidebarProps {
  document?: DocumentMeta;
  className?: string;
  onClose?: () => void;
}

const AIAssistantSidebar = ({ document, className = '', onClose }: AIAssistantSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAllDocuments = async () => {
    try {
      const docs = await getAllDocumentsForAI();
      setAllDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents for AI:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create context for the AI
      let context = '';
      if (document) {
        context = `Current Document: "${document.title}"
Content Type: ${document.content_type}
Content: ${document.content.substring(0, 2000)}...

`;
      }

      const prompt = `${context}User Question: ${inputMessage}

Please analyze this in the context of all the user's documents and provide strategic insights.`;

      const response = await callGrandStrategist(prompt);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response || 'I apologize, but I encountered an issue processing your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Grand Strategist:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`w-96 h-full flex flex-col ${className}`}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-blue-50 to-teal-50">
        <CardTitle className="text-lg font-medium text-blue-700 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Grand Strategist Claude
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <p className="text-sm">
                  Ask Grand Strategist Claude anything about your documents, strategies, or for analysis and insights.
                </p>
                {document && (
                  <p className="text-xs mt-2 text-blue-600">
                    Currently analyzing: {document.title}
                  </p>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-4'
                      : 'bg-blue-50 border border-blue-200 mr-4'
                  }`}
                >
                  {message.type === 'ai' ? (
                    <AIResponseFormatter content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-blue-100' : 'text-blue-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mr-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about strategies, analysis, or insights..."
              className="min-h-[60px] resize-none border-blue-200 focus:border-blue-400"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantSidebar;
