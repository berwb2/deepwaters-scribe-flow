
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  BookOpen, 
  FileText, 
  FolderOpen, 
  Calendar as CalendarIcon, 
  Brain,
  Edit3,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/folders', icon: FolderOpen, label: 'Folders' },
    { path: '/books', icon: BookOpen, label: 'Books' },
    { path: '/book-writer', icon: Edit3, label: 'Book Writer' },
    { path: '/grand-strategist', icon: Brain, label: 'Grand Strategist' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/account', icon: Settings, label: 'Settings' },
  ];

  if (isMobile) {
    return null; // Use MobileNav on mobile
  }
  
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-blue-200 flex flex-col transition-all duration-300 relative`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 bg-white border border-blue-200 rounded-full h-6 w-6"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="p-6">
        {!collapsed && (
          <h2 className="text-lg font-serif font-medium text-blue-600 mb-4">DeepWaters</h2>
        )}
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`${collapsed ? 'w-10 h-10 p-0' : 'w-full'} justify-start ${
                  isActive(item.path) 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Link to={item.path}>
                  <Icon className={`h-4 w-4 ${!collapsed ? 'mr-3' : ''}`} />
                  {!collapsed && item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      
      {!collapsed && (
        <div className="mt-auto p-6 border-t border-blue-200">
          <div className="text-xs text-blue-600">
            <p className="font-medium mb-1">DeepWaters</p>
            <p>Your AI-powered workspace</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
