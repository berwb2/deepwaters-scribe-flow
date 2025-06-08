
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Users, TrendingUp, Settings, Lightbulb, Zap } from 'lucide-react';
import { DocumentMeta } from '@/types/documents';

interface AIInsights {
  keyPoints: string[];
  actionItems: string[];
  strategicRecommendations: string[];
  connections: string[];
}

interface AIAssistantSidebarProps {
  document?: DocumentMeta;
  className?: string;
}

const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({ document, className = "" }) => {
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const aiGenerals = [
    { icon: Target, name: "General Flos", specialization: "Intelligence", color: "bg-red-500" },
    { icon: Users, name: "General Sophist", specialization: "Communications", color: "bg-green-500" },
    { icon: TrendingUp, name: "General Craftwright", specialization: "Innovation", color: "bg-purple-500" },
    { icon: TrendingUp, name: "General Merchant", specialization: "Revenue", color: "bg-yellow-500" },
    { icon: Settings, name: "General Steward", specialization: "Operations", color: "bg-blue-500" },
  ];

  const generateAIInsights = async () => {
    if (!document) return;
    
    setIsAnalyzing(true);
    try {
      // Mock AI analysis - in production this would call your Azure OpenAI endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAiInsights({
        keyPoints: [
          "Strategic planning document with 3 key objectives",
          "Revenue growth target of 25% identified",
          "Market expansion opportunities highlighted"
        ],
        actionItems: [
          "Schedule team meeting within 48 hours",
          "Create detailed implementation timeline",
          "Identify key stakeholders for approval"
        ],
        strategicRecommendations: [
          "Consider phased implementation approach",
          "Allocate additional resources for Q2",
          "Establish KPI tracking system"
        ],
        connections: [
          "Links to Q1 Strategy Document",
          "Related to Revenue Forecasting Plan",
          "Connects with Team Capacity Analysis"
        ]
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const consultGeneral = (general: any) => {
    console.log(`Consulting ${general.name} for ${general.specialization} advice`);
    // This would open a consultation dialog or navigate to the general's page
  };

  useEffect(() => {
    if (document) {
      generateAIInsights();
    }
  }, [document]);

  return (
    <div className={`w-80 bg-white border-l border-blue-200 p-4 space-y-4 overflow-y-auto ${className}`}>
      {/* Supreme Commander Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg text-blue-700">Supreme Commander Claude</CardTitle>
              <p className="text-sm text-blue-600">Your AI Strategic Advisor</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {document && (
        <>
          {/* Document Analysis */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Document Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing document...
                </div>
              ) : aiInsights ? (
                <>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">🔍 Key Insights</h5>
                    <ul className="text-sm space-y-1">
                      {aiInsights.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-blue-600">• {point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">⚡ Action Items</h5>
                    <ul className="text-sm space-y-1">
                      {aiInsights.actionItems.map((item, idx) => (
                        <li key={idx} className="text-blue-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={generateAIInsights} 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Document
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          {aiInsights && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700">🎯 Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.strategicRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 rounded text-sm text-blue-700">
                    {rec}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Generals Panel */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700">⚔️ AI Generals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {aiGenerals.map((general, idx) => {
            const Icon = general.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left border-blue-200 hover:bg-blue-50"
                size="sm"
                onClick={() => consultGeneral(general)}
              >
                <div className={`w-2 h-2 rounded-full ${general.color} mr-2`}></div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-blue-700">{general.name}</span>
                  <span className="text-xs text-blue-500">{general.specialization}</span>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Document Connections */}
      {aiInsights && document && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">🔗 Document Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {aiInsights.connections.map((connection, idx) => (
              <div key={idx} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                • {connection}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistantSidebar;
