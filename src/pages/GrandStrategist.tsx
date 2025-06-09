
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Plus, Menu } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { listDocuments, getCurrentUser } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: documentsData } = useQuery({
    queryKey: ['all-documents-for-strategist'],
    queryFn: async () => {
      // Fetch ALL documents without pagination limit
      const response = await listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 10000);
      console.log(`Grand Strategist has access to ${response.documents.length} documents out of ${response.total} total`);
      return response;
    },
    enabled: !!user,
  });

  const documents = documentsData?.documents || [];

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      if (isMobile) setSidebarOpen(false);
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <MobileNav />
      
      <div className="flex flex-1">
        {!isMobile && <Sidebar />}
        
        {/* Conversation Sidebar */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="w-80 h-full bg-white" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Conversations</h3>
                  <Button size="sm" onClick={() => { startNewConversation(); setSidebarOpen(false); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-3 overflow-y-auto h-full">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id 
                        ? 'bg-gray-100' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => { setActiveConversation(conv); setSidebarOpen(false); }}
                  >
                    <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{conv.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isMobile && (
          <div className="w-80 border-r bg-white">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Conversations</h3>
                <Button size="sm" onClick={startNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto">
              {conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation?.id === conv.id 
                      ? 'bg-gray-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{conv.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="mr-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="font-medium">Grand Strategist</h1>
                  <p className="text-sm text-gray-600">{documents.length} documents available</p>
                </div>
              </div>
            </div>
          </div>

          {activeConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeConversation.messages.length === 0 && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-medium mb-2">What can I help with?</h2>
                    <p className="text-gray-600">I have access to all {documents.length} of your documents</p>
                  </div>
                )}

                {activeConversation.messages.map((msg) => (
                  <div key={msg.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {msg.role === 'user' ? (
                        <span className="text-sm font-medium">You</span>
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="max-w-3xl mx-auto">
                  <div className="relative bg-gray-50 rounded-3xl border border-gray-200">
                    <Textarea
                      placeholder="Message Grand Strategist..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-0 bg-transparent resize-none focus:ring-0 rounded-3xl px-4 py-3 pr-12"
                      rows={1}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !message.trim()}
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-medium mb-2">What can I help with?</h2>
                <p className="text-gray-600 mb-4">I have access to all {documents.length} of your documents</p>
                <Button onClick={startNewConversation} className="mt-4">
                  Start a conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrandStrategist;
