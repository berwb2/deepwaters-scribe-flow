
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu,
  Home,
  FileText, 
  FolderOpen, 
  BookOpen,
  Edit3,
  Brain,
  Calendar as CalendarIcon,
  Settings
} from 'lucide-react';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-lg font-serif font-medium text-blue-600">DeepWaters</h2>
            <p className="text-sm text-blue-600">Your AI-powered workspace</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
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
                  onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
