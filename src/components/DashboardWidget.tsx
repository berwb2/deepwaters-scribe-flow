import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FolderOpen, BookOpen, Brain } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardWidget = () => {
  const isMobile = useIsMobile();

  const quickActions = [
    {
      to: '/documents',
      icon: FileText,
      title: 'Documents',
      description: 'Manage files',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      to: '/folders',
      icon: FolderOpen,
      title: 'Folders',
      description: 'Organize content',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      to: '/book-writer',
      icon: BookOpen,
      title: 'Write',
      description: 'Create books',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      to: '/grand-strategist',
      icon: Brain,
      title: 'AI Chat',
      description: 'Get insights',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className={`grid gap-3 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Card key={action.to} className="hover:shadow-md transition-all duration-200 hover-scale">
            <CardContent className="p-4">
              <Link to={action.to} className="block">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${action.bgColor} rounded-lg`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardWidget;