
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  FileText, 
  Folder, 
  Book, 
  Brain, 
  Calendar, 
  Plus,
  Search,
  Settings,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Folder, label: 'Folders', path: '/folders' },
    { icon: Book, label: 'Books', path: '/books' },
    { icon: Brain, label: 'Grand Strategist', path: '/grand-strategist' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  const aiGenerals = [
    { icon: Target, label: 'General Flos', subtitle: 'Intelligence', path: '/ai-generals/intelligence' },
    { icon: Users, label: 'General Sophist', subtitle: 'Communications', path: '/ai-generals/communications' },
    { icon: TrendingUp, label: 'General Craftwright', subtitle: 'Innovation', path: '/ai-generals/innovation' },
    { icon: TrendingUp, label: 'General Merchant', subtitle: 'Revenue', path: '/ai-generals/revenue' },
    { icon: Settings, label: 'General Steward', subtitle: 'Operations', path: '/ai-generals/operations' },
  ];

  return (
    <div className="w-64 bg-white border-r border-blue-200 min-h-screen p-4 space-y-4 shadow-lg">
      {/* Quick Actions */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full justify-start bg-blue-500 hover:bg-blue-600" size="sm">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start border-blue-300" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Global Search
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${
                  isActive(item.path) 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
                size="sm"
              >
                <Link to={item.path}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Separator className="bg-blue-200" />

      {/* AI Generals */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700">🎯 AI Generals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {aiGenerals.map((general) => {
            const Icon = general.icon;
            return (
              <Button
                key={general.path}
                asChild
                variant={isActive(general.path) ? "default" : "ghost"}
                className={`w-full justify-start text-xs ${
                  isActive(general.path) 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
                size="sm"
              >
                <Link to={general.path}>
                  <Icon className="mr-2 h-3 w-3" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{general.label}</span>
                    <span className="text-xs opacity-75">{general.subtitle}</span>
                  </div>
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Separator className="bg-blue-200" />

      {/* Settings */}
      <Card className="border-blue-200">
        <CardContent className="pt-4">
          <Button 
            asChild 
            variant="ghost" 
            className="w-full justify-start text-blue-700 hover:bg-blue-100" 
            size="sm"
          >
            <Link to="/account">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
