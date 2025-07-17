
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import Wave from '@/components/Wave';
import { ArrowRight, File, Search, Upload, Calendar, List, Tag, BookOpen, Brain, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  
  // Get current user status
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleShowPreview = () => {
    setShowPreview(true);
    // Scroll to preview section
    setTimeout(() => {
      document.getElementById('preview-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-blue-50 py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-4xl md:text-6xl font-serif leading-tight">
              Welcome to DeepWaters—<br className="hidden sm:block" />
              <span className="text-blue-600">a serene space</span> for planning, reflection, and growth
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-700 leading-relaxed max-w-3xl mx-auto">
              Transform your lengthy plans, doctrines, and reflections into beautifully structured, 
              easy-to-navigate documents with AI-powered strategic insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg bg-blue-500 hover:bg-blue-600" asChild>
                <Link to="/login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={handleShowPreview}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Show App Preview
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-blue-300/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute top-40 right-32 w-16 h-16 bg-blue-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute bottom-40 right-20 w-32 h-32 bg-blue-200/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 text-blue-600">
            Experience Clarity in Your Planning
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-blue-100 rounded-full mb-6">
                <File className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-blue-700">Beautiful Documents</h3>
              <p className="text-blue-600">
                Transform your plain text into beautifully formatted documents with rich text editing and automatic structure detection.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-blue-100 rounded-full mb-6">
                <Brain className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-blue-700">AI Strategic Analysis</h3>
              <p className="text-blue-600">
                Leverage the Grand Strategist AI to analyze your documents and provide strategic insights and planning guidance.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-blue-100 rounded-full mb-6">
                <List className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-blue-700">Smart Organization</h3>
              <p className="text-blue-600">
                Organize with nested folders, document types, and powerful search across your entire knowledge base.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Details Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 text-blue-600">
              Powerful Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-200 rounded-full mr-4">
                    <BookOpen className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-medium text-blue-700">Book Writing System</h3>
                </div>
                <p className="text-blue-600 mb-4">
                  Create complete books with organized chapters. Manage your writing projects with word count tracking and seamless chapter navigation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Chapter creation and management
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Word count tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Export capabilities
                  </li>
                </ul>
              </div>
              
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-200 rounded-full mr-4">
                    <Zap className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-medium text-blue-700">Grand Strategist AI</h3>
                </div>
                <p className="text-blue-600 mb-4">
                  Get strategic insights from our elite AI advisor that analyzes your entire document ecosystem for patterns and opportunities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Cross-document analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Strategic planning guidance
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span> 
                    Life optimization insights
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Preview Section */}
      {showPreview && (
        <section id="preview-section" className="relative bg-gradient-to-t from-background to-blue-50 py-20">
          <Wave position="top" color="text-background" className="absolute top-0 left-0 right-0" />
          
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-center text-blue-600 mb-6">
                See DeepWaters in Action
              </h2>
              <p className="text-center text-lg mb-12 max-w-2xl mx-auto text-blue-700">
                Watch how your lengthy documents transform into beautifully structured, easy-to-navigate content with AI-powered insights.
              </p>
              
              <div className="bg-white border border-blue-200 rounded-lg p-4 md:p-8 shadow-xl">
                <div className="rounded-lg overflow-hidden">
                  <div className="aspect-video bg-blue-100 flex items-center justify-center border border-blue-200">
                    <div className="text-center">
                      <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <div className="text-blue-700 text-lg font-medium mb-2">
                        Interactive Application Preview
                      </div>
                      <p className="text-blue-600 text-sm max-w-md">
                        Experience the full application with document creation, AI analysis, and book writing features
                      </p>
                      <Button 
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                        asChild
                      >
                        <Link to="/login">
                          Try DeepWaters Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="relative bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to dive deeper?</h2>
            <p className="text-xl mb-8">
              Start creating beautiful, structured documents with AI-powered strategic insights today.
            </p>
            <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-blue-600" asChild>
              <Link to="/login">
                Get Started Now
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-10">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" 
              className="fill-background"
            ></path>
          </svg>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="sm" />
            <div className="mt-4 md:mt-0 text-blue-600">
              © {new Date().getFullYear()} DeepWaters. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
