
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from './Logo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, signOut } from '@/lib/api';
import GlobalSearch from './GlobalSearch';
import { Menu, File, Calendar, Tag, LogOut, Settings, User } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  // Handle scroll events to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    queryClient.invalidateQueries({queryKey: ['currentUser']});
  };
  
  return (
    <nav className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm ${scrolled ? 'border-b shadow-sm' : ''}`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <Logo size="small" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Button variant={isActive('/') ? "default" : "ghost"} asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant={isActive('/documents') ? "default" : "ghost"} asChild>
              <Link to="/documents">Documents</Link>
            </Button>
            {user && (
              <Button variant={isActive('/create') ? "default" : "ghost"} asChild>
                <Link to="/create">Create</Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <GlobalSearch />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline-block">
                    {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/documents" className="w-full flex items-center">
                    <File className="mr-2 h-4 w-4" /> My Documents
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/" className="w-full">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/documents" className="w-full">Documents</Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/create" className="w-full">Create</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
