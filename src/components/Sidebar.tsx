
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  FolderOpen, 
  Calendar as CalendarIcon, 
  Brain,
  Edit3,
  BarChart3,
  Settings,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/folders', icon: FolderOpen, label: 'Folders' },
    { path: '/books', icon: BookOpen, label: 'Books' },
    { path: '/book-writer', icon: Edit3, label: 'Book Writer' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/grand-strategist', icon: Brain, label: 'Grand Strategist' },
    { path: '/account', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <div className="w-64 bg-white border-r border-blue-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-serif font-medium text-blue-600 mb-4">Navigation</h2>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive(item.path) 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Link to={item.path}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-blue-200">
        <div className="text-xs text-blue-600">
          <p className="font-medium mb-1">DeepWaters</p>
          <p>Your AI-powered workspace</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
