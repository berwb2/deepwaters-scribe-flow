import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RichTextEditor from '@/components/RichTextEditor';
import DocumentRenderer from '@/components/DocumentRenderer';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getDocument, updateDocument, callGrandStrategist, getAISession, createAISession, updateAISession } from '@/lib/api';
import { DOCUMENT_TYPES } from '@/types/documentTypes';
import { ArrowLeft, Edit, Calendar, Clock, MessageSquare, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const ViewDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSession, setAiSession] = useState<any>(null);
  const [tocOpen, setTocOpen] = useState(!isMobile);

  useEffect(() => {
    if (id) {
      loadDocument();
      initializeAI();
    }
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const docData = await getDocument(id);
      setDocument(docData);
      setContent(docData.content || '');
      setTitle(docData.title || '');
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAI = async () => {
    if (!id) return;
    
    try {
      let session = await getAISession(id, 'document');
      if (!session) {
        session = await createAISession(id, 'document');
      }
      setAiSession(session);
      
      // Safely handle chat_history with proper type checking
      const chatHistory = session.chat_history;
      if (Array.isArray(chatHistory)) {
        setAiMessages(chatHistory);
      } else {
        setAiMessages([]);
      }
    } catch (error) {
      console.error('Error initializing AI:', error);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      await updateDocument(id, { 
        title: title.trim(),
        content: content 
      });
      
      // Reload document to get updated data
      await loadDocument();
      
      setIsEditing(false);
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiQuestion = async () => {
    if (!aiInput.trim() || !document || !aiSession) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setIsAiLoading(true);

    const newMessages = [...aiMessages, { role: 'user', content: userMessage }];
    setAiMessages(newMessages);

    try {
      const response = await callGrandStrategist(userMessage, {
        id: document.id,
        title: document.title,
        content: document.content,
        type: 'document'
      });

      const assistantMessage = { role: 'assistant', content: response.response || response };
      const updatedMessages = [...newMessages, assistantMessage];
      setAiMessages(updatedMessages);

      // Update AI session with chat history
      await updateAISession(aiSession.id, {
        chat_history: updatedMessages
      });
    } catch (error) {
      console.error('Error calling AI:', error);
      setAiMessages([...newMessages, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please check your AI configuration and try again.' 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateTableOfContents = () => {
    if (!content) return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
      element: heading
    }));
  };

  const scrollToHeading = (text: string) => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const targetHeading = Array.from(headings).find(h => {
      const element = h as HTMLElement;
      return element.textContent === text;
    });
    
    if (targetHeading) {
      const element = targetHeading as HTMLElement;
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = generateTableOfContents();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Navbar />
        <div className="flex">
          {!isMobile && <Sidebar />}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-blue-200 rounded mb-4"></div>
                <div className="h-64 bg-blue-100 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Navbar />
        <div className="flex">
          {!isMobile && <Sidebar />}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Document not found</h1>
                <p className="text-gray-600 mb-6">The document you're looking for doesn't exist or has been removed.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/documents">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Documents
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const documentType = DOCUMENT_TYPES.find(type => type.id === document.content_type) || DOCUMENT_TYPES[0];
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />
      
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <main className={`flex-1 ${isMobile ? 'p-2' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4 text-blue-600 hover:text-blue-800">
                <Link to="/documents">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Documents
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Table of Contents - Left Sidebar */}
              {tableOfContents.length > 0 && (
                <div className="lg:col-span-3">
                  <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full mb-4 lg:hidden bg-white shadow-sm">
                        Table of Contents
                        {tocOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="sticky top-6 bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Contents
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 max-h-96 overflow-y-auto">
                          <nav className="space-y-2 py-4">
                            {tableOfContents.map((item, index) => (
                              <button
                                key={index}
                                onClick={() => scrollToHeading(item.text)}
                                className={`block text-left text-sm hover:text-blue-600 transition-all duration-200 w-full rounded-md p-2 hover:bg-blue-50 ${
                                  item.level === 1 ? 'font-semibold text-blue-900 text-base' :
                                  item.level === 2 ? 'ml-3 font-medium text-blue-800' :
                                  item.level === 3 ? 'ml-6 text-blue-700' :
                                  'ml-9 text-blue-600'
                                }`}
                              >
                                {item.text}
                              </button>
                            ))}
                          </nav>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {/* Main Content */}
              <div className={`${tableOfContents.length > 0 ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
                <Card className="border-blue-200 shadow-xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="text-xl sm:text-2xl font-bold bg-white/20 border border-white/30 outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-3 py-2 w-full text-white placeholder-white/70"
                              placeholder="Document title..."
                            />
                          ) : (
                            <CardTitle className="text-xl sm:text-2xl text-white break-words leading-tight">
                              {document.title}
                            </CardTitle>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowAI(!showAI)}
                            className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {showAI ? 'Hide' : 'Show'} AI
                          </Button>
                          
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setIsEditing(false);
                                  setContent(document.content || '');
                                  setTitle(document.title || '');
                                }}
                                disabled={isSaving}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !title.trim()}
                                className="bg-white text-blue-600 hover:bg-white/90"
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setIsEditing(true)}
                              className="bg-white text-blue-600 hover:bg-white/90 flex-shrink-0"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="secondary" className={`${documentType.color} bg-white/20 text-white border-white/30`}>
                          {documentType.name}
                        </Badge>
                        
                        <div className="flex items-center text-white/90">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Created </span>
                          {new Date(document.created_at).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center text-white/90">
                          <Clock className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Updated </span>
                          {new Date(document.updated_at).toLocaleString()}
                        </div>
                        
                        <div className="flex items-center text-white/90">
                          <span>{wordCount} words</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {isEditing ? (
                      <div className="p-6">
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                          placeholder="Start writing your document content here..."
                        />
                      </div>
                    ) : (
                      <div className="p-2">
                        <DocumentRenderer 
                          document={{
                            ...document,
                            content: content
                          }} 
                          className="min-h-96"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Chat Panel */}
              {showAI && (
                <div className="lg:col-span-3">
                  <Card className="sticky top-6 h-[600px] flex flex-col shadow-xl border-purple-200">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                      <CardTitle className="text-lg">Grand Strategist AI</CardTitle>
                      <p className="text-sm opacity-90">Your intelligent writing assistant</p>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col p-4">
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        {aiMessages.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="mx-auto h-12 w-12 text-purple-300 mb-3" />
                            <p className="text-sm">Ask me anything about your document!</p>
                            <p className="text-xs text-gray-400 mt-1">I can help with writing, editing, and analysis</p>
                          </div>
                        )}
                        
                        {aiMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm shadow-sm ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-800 border'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            </div>
                          </div>
                        ))}
                        
                        {isAiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-3 py-2 border">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="border-t pt-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAiQuestion()}
                            placeholder="Ask about your document..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isAiLoading}
                          />
                          <Button
                            onClick={handleAiQuestion}
                            disabled={!aiInput.trim() || isAiLoading}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewDocument;
