
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DashboardWidget from '@/components/DashboardWidget';
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Crown, Zap, Target, TrendingUp, Shield, Eye, BarChart3, Settings, FileText, Users, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedDocuments } from '@/hooks/useEnhancedDocuments';
import { supabase } from '@/integrations/supabase/client';

const GrandStrategist = () => {
  const isMobile = useIsMobile();
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(true);
  const [strategicMetrics, setStrategicMetrics] = useState({
    totalDocuments: 0,
    strategicOpportunities: 0,
    riskFactors: 0,
    completedAnalyses: 0
  });

  const { data: documents, isLoading } = useEnhancedDocuments();

  useEffect(() => {
    if (documents) {
      setStrategicMetrics(prev => ({
        ...prev,
        totalDocuments: documents.length,
        strategicOpportunities: Math.floor(documents.length * 0.3),
        riskFactors: Math.floor(documents.length * 0.15),
        completedAnalyses: Math.floor(documents.length * 0.8)
      }));
    }
  }, [documents]);

  const quickAnalysisActions = [
    {
      title: "Document Intelligence Review",
      description: "Comprehensive analysis of all documents for strategic insights",
      icon: <FileText className="h-6 w-6" />,
      action: "Analyze all documents for strategic patterns, opportunities, and risks. Provide executive summary.",
      color: "bg-blue-500"
    },
    {
      title: "Threat Assessment Matrix",
      description: "Identify and categorize potential threats and vulnerabilities",
      icon: <Shield className="h-6 w-6" />,
      action: "Review all documents to identify threats, risks, and vulnerabilities. Provide mitigation strategies.",
      color: "bg-red-500"
    },
    {
      title: "Opportunity Mapping",
      description: "Discover untapped strategic opportunities across documents",
      icon: <Target className="h-6 w-6" />,
      action: "Analyze documents to identify strategic opportunities, market gaps, and growth potential.",
      color: "bg-green-500"
    },
    {
      title: "Performance Analytics",
      description: "Evaluate strategic performance and recommend optimizations",
      icon: <BarChart3 className="h-6 w-6" />,
      action: "Evaluate current performance metrics and strategic positioning. Recommend optimization strategies.",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <MobileNav />
      
      <div className="flex flex-1">
        {!isMobile && <Sidebar />}
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Actions Dashboard */}
            <DashboardWidget />
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Crown className="h-8 w-8 text-yellow-600" />
                    Grand Strategist Command Center
                  </h1>
                  <p className="text-slate-600 mt-2">Strategic intelligence and document analysis powered by Chaldion AI</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                  <Brain className="h-4 w-4 mr-2" />
                  Chaldion Online
                </Badge>
              </div>
            </div>

            {/* Strategic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Documents</p>
                      <p className="text-2xl font-bold text-blue-800">{strategicMetrics.totalDocuments}</p>
                    </div>
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Strategic Opportunities</p>
                      <p className="text-2xl font-bold text-green-800">{strategicMetrics.strategicOpportunities}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Risk Factors</p>
                      <p className="text-2xl font-bold text-red-800">{strategicMetrics.riskFactors}</p>
                    </div>
                    <Shield className="h-10 w-10 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Completed Analyses</p>
                      <p className="text-2xl font-bold text-purple-800">{strategicMetrics.completedAnalyses}</p>
                    </div>
                    <Activity className="h-10 w-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Quick Analysis Actions */}
              <div className="xl:col-span-2">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Strategic Analysis Command
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickAnalysisActions.map((action, index) => (
                        <Card key={index} className="border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                {action.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 group-hover:text-slate-900">{action.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="mt-3 text-xs"
                                  onClick={() => {
                                    // This would be handled by the AI sidebar component
                                    console.log('Execute:', action.action);
                                  }}
                                >
                                  Execute Analysis
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="xl:col-span-1">
                <AIAssistantSidebar 
                  isOpen={isAISidebarOpen}
                  onToggle={() => setIsAISidebarOpen(!isAISidebarOpen)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GrandStrategist;
