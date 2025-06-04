
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import Logo from '@/components/Logo';
import GlobalSearch from '@/components/GlobalSearch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // For demo purposes
  // In a real app, this would come from authentication state
  const user = {
    name: 'User',
    initials: 'U'
  };
  
  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <Link to="/" className="flex items-center">
            <Logo size="small" showText={!isMobile} />
          </Link>
        </div>
        
        {!isMobile && (
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
            <Button asChild variant="ghost">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/documents">Documents</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/folders">Folders</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/calendar">Calendar</Link>
            </Button>
          </nav>
        )}
        
        <div className="flex items-center space-x-4">
          {!isMobile && <GlobalSearch />}
          
          <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="font-medium">{user.name}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/account')}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/documents')}>
                My Documents
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/login')}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t px-4 py-3 bg-background">
          <div className="space-y-1">
            <Link to="/dashboard" className="block py-2 px-3 rounded-md hover:bg-accent">
              Dashboard
            </Link>
            <Link to="/documents" className="block py-2 px-3 rounded-md hover:bg-accent">
              Documents
            </Link>
            <Link to="/folders" className="block py-2 px-3 rounded-md hover:bg-accent">
              Folders
            </Link>
            <Link to="/calendar" className="block py-2 px-3 rounded-md hover:bg-accent">
              Calendar
            </Link>
            <div className="pt-2">
              <GlobalSearch />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
