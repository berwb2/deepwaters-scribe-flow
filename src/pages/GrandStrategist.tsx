
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Plus, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { listDocuments, getCurrentUser } from '@/lib/api';

interface StrategistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: StrategistMessage[];
  lastMessage: string;
  timestamp: string;
  userId: string;
}

const GrandStrategist = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: documentsData } = useQuery({
    queryKey: ['all-documents-for-strategist'],
    queryFn: async () => {
      const response = await listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 1000);
      console.log(`Grand Strategist has access to ${response.documents.length} documents`);
      return response;
    },
  });

  const documents = documentsData?.documents || [];

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', 'conversation')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const convs = data?.map(doc => ({
        id: doc.id,
        title: doc.title,
        messages: JSON.parse(doc.content || '[]'),
        lastMessage: JSON.parse(doc.content || '[]').slice(-1)[0]?.content || 'New conversation',
        timestamp: new Date(doc.updated_at).toLocaleDateString(),
        userId: doc.user_id
      })) || [];

      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const startNewConversation = async () => {
    if (!user) return;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      lastMessage: 'New conversation',
      timestamp: new Date().toLocaleDateString(),
      userId: user.id
    };

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          content: JSON.stringify([]),
          content_type: 'conversation'
        })
        .select()
        .single();

      if (error) throw error;

      newConv.id = data.id;
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation');
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: conversation.title,
          content: JSON.stringify(conversation.messages),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const callGrandStrategist = async (userMessage: string, documentContext: any[] = []) => {
    try {
      console.log(`Sending ${documentContext.length} documents to Grand Strategist`);
      
      const { data, error } = await supabase.functions.invoke('grand-strategist', {
        body: {
          message: userMessage,
          documents: documentContext,
          analysis_mode: 'chat'
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Grand Strategist API error:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation || !user) return;

    const userMessage: StrategistMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
      lastMessage: message,
      timestamp: new Date().toLocaleDateString()
    };

    if (updatedConversation.title === 'New Conversation' && message.length > 0) {
      updatedConversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    }

    setActiveConversation(updatedConversation);
    setConversations(prevConvs => 
      prevConvs.map(conv => conv.id === activeConversation.id ? updatedConversation : conv)
    );
    setMessage('');
    setIsLoading(true);

    try {
      const response = await callGrandStrategist(message, documents);
      
      const assistantMessage: StrategistMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        lastMessage: response.substring(0, 100) + (response.length > 100 ? '...' : '')
      };

      setActiveConversation(finalConversation);
      setConversations(prevConvs => 
        prevConvs.map(conv => conv.id === activeConversation.id ? finalConversation : conv)
      );

      await saveConversation(finalConversation);
    } catch (error) {
      toast.error('Failed to get response from Grand Strategist');
      console.error('Grand Strategist error:', error);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 flex">
          {/* Conversation Sidebar */}
          <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-blue-200 bg-white`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-blue-700">Conversations</h3>
                  <Button 
                    size="sm" 
                    onClick={startNewConversation}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <h4 className="font-medium text-blue-700 text-sm truncate">{conv.title}</h4>
                    <p className="text-blue-600 text-xs mt-1 line-clamp-2">{conv.lastMessage}</p>
                    <span className="text-blue-500 text-xs">{conv.timestamp}</span>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center text-blue-600 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs opacity-75">Start a new chat to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-blue-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    {sidebarOpen ? '←' : '→'}
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-serif font-medium text-blue-600">Grand Strategist Claude</h1>
                      <p className="text-blue-700 text-sm">Ready to serve • {documents.length} documents available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeConversation.messages.length === 0 && (
                    <div className="text-center py-12">
                      <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-blue-600 mb-2">Grand Strategist Ready</h3>
                      <p className="text-blue-700 text-sm max-w-md mx-auto">
                        I am Claude the Magnificent, your Supreme AI Commander. Ready to provide strategic guidance with 
                        full access to your complete document ecosystem ({documents.length} documents).
                      </p>
                    </div>
                  )}

                  {activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                        <div className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-blue-100' : 'text-blue-600'
                        }`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-blue-200 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-sm text-blue-700 ml-2">Grand Strategist analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-blue-200 p-6 bg-white">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Share your thoughts with the Grand Strategist..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-h-[60px] border-blue-200 focus:border-blue-400 bg-white resize-none"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !message.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-[60px]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Enter to send • Shift+Enter for new line • {documents.length} documents in intelligence network
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="h-24 w-24 text-blue-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-serif font-medium text-blue-600 mb-2">Welcome back</h2>
                  <p className="text-blue-700 mb-6 max-w-md">
                    Start a new conversation with your Grand Strategist or continue an existing one.
                  </p>
                  <Button 
                    onClick={startNewConversation}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Begin Strategic Consultation
                  </Button>
                </div>
              </div>
            )}
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
