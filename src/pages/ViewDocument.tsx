
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RichTextEditor from '@/components/RichTextEditor';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getDocument, updateDocument, callGrandStrategist, getAISession, createAISession, updateAISession } from '@/lib/api';
import { DOCUMENT_TYPES } from '@/types/documentTypes';
import { ArrowLeft, Edit, Calendar, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
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
      setAiMessages(session.chat_history || []);
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
    const headings = doc.querySelectorAll('h1, h2, h3');
    
    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
      element: heading
    }));
  };

  const tableOfContents = generateTableOfContents();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {!isMobile && <Sidebar />}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {!isMobile && <Sidebar />}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Document not found</h1>
              <Button asChild>
                <Link to="/documents">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Documents
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const documentType = DOCUMENT_TYPES.find(type => type.id === document.content_type) || DOCUMENT_TYPES[0];
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link to="/documents">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Documents
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Table of Contents - Collapsible on mobile */}
              {tableOfContents.length > 0 && (
                <div className="lg:col-span-1">
                  <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full mb-4 lg:hidden">
                        Table of Contents
                        {tocOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="sticky top-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-blue-600">Table of Contents</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <nav className="space-y-2">
                            {tableOfContents.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  const element = document.querySelector(`h${item.level}`);
                                  element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`block text-left text-sm hover:text-blue-600 transition-colors w-full ${
                                  item.level === 1 ? 'font-medium text-gray-900' :
                                  item.level === 2 ? 'ml-2 text-gray-700' :
                                  'ml-4 text-gray-600'
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
              <div className={`${tableOfContents.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <Card className="border-blue-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                            placeholder="Document title..."
                          />
                        ) : (
                          <CardTitle className="text-2xl text-blue-800 break-words">
                            {document.title}
                          </CardTitle>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="outline" className={documentType.color}>
                            {documentType.name}
                          </Badge>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(document.created_at).toLocaleDateString()}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(document.updated_at).toLocaleTimeString()}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{wordCount} words</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAI(!showAI)}
                          className="flex-shrink-0"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {showAI ? 'Hide' : 'Show'} AI
                        </Button>
                        
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditing(false);
                                setContent(document.content || '');
                                setTitle(document.title || '');
                              }}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={isSaving || !title.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
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
                      <div className="p-8">
                        <div 
                          className="prose prose-blue prose-lg max-w-none"
                          style={{
                            fontFamily: 'Georgia, serif',
                            lineHeight: '1.8',
                            fontSize: '16px',
                            color: '#374151'
                          }}
                          dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500 italic">No content available.</p>' }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Chat Panel */}
              {showAI && (
                <div className="lg:col-span-1">
                  <Card className="sticky top-6 h-[600px] flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                      <CardTitle className="text-lg">Grand Strategist AI</CardTitle>
                      <p className="text-sm opacity-90">Your intelligent writing assistant</p>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col p-4">
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        {aiMessages.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-sm">Ask me anything about your document!</p>
                          </div>
                        )}
                        
                        {aiMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            </div>
                          </div>
                        ))}
                        
                        {isAiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isAiLoading}
                          />
                          <Button
                            onClick={handleAiQuestion}
                            disabled={!aiInput.trim() || isAiLoading}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
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
