
import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DashboardWidget from '@/components/DashboardWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const GrandStrategist = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <MobileNav />
      
      <div className="flex flex-1">
        {!isMobile && <Sidebar />}
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Actions Dashboard */}
            <DashboardWidget />
            
            <div className="flex items-center justify-center">
              <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-gray-400" />
              </div>
              <CardTitle className="text-xl font-medium">AI Assistant Temporarily Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The Grand Strategist AI assistant is currently being updated and will be available again soon.
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                We're working on improvements to serve you better
              </p>
            </CardContent>
          </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GrandStrategist;
