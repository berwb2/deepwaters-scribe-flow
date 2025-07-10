import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import { Brain, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GrandStrategist = () => {
  const { user } = useAuth();
  const [sessionId] = useState(() => `chaldion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <MobileNav />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Crown className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chaldion</h1>
                <p className="text-sm text-muted-foreground">Strategic Intelligence System</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Online</span>
            </div>
          </div>
        </div>

        {/* Full-page AI Interface */}
        <div className="flex-1 overflow-hidden">
          <AIAssistantSidebar 
            isOpen={true}
            onToggle={() => {}}
            fullPage={true}
            sessionId={sessionId}
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default GrandStrategist;