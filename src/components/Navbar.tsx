
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Home, FileText, Calendar as CalendarIcon, Folder, Book, Brain } from 'lucide-react';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="font-serif text-xl font-medium text-blue-600">DeepWaters</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/documents" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </Link>
                <Link 
                  to="/folders" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <Folder className="h-4 w-4" />
                  <span>Folders</span>
                </Link>
                <Link 
                  to="/books" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <Book className="h-4 w-4" />
                  <span>Books</span>
                </Link>
                <Link 
                  to="/grand-strategist" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <Brain className="h-4 w-4" />
                  <span>Grand Strategist</span>
                </Link>
                <Link 
                  to="/calendar" 
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <GlobalSearch />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.display_name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
