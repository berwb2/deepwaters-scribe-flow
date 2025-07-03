
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface AIAssistantSidebarProps {
  document?: any;
  className?: string;
  onClose?: () => void;
}

const AIAssistantSidebar = ({ className = '' }: AIAssistantSidebarProps) => {
  return (
    <Card className={`w-96 h-full flex flex-col ${className}`}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-blue-50 to-teal-50">
        <CardTitle className="text-lg font-medium text-blue-700 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <p className="text-sm">
            AI Assistant is temporarily unavailable while we work on improvements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantSidebar;
