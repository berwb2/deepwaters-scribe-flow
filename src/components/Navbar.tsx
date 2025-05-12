
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Logo from './Logo';
import { FileText, LogOut, Menu, Plus, Settings, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, signOut } from '@/lib/api';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // The page will reload due to auth state change
    } catch (error) {
      // Error is handled in signOut function
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size="small" />
        </Link>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-water-deep transition-colors">
            Home
          </Link>
          <Link to="/documents" className="text-foreground hover:text-water-deep transition-colors">
            My Documents
          </Link>
          <Link to="/create" className="text-foreground hover:text-water-deep transition-colors">
            Create New
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/documents" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Documents</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          )}
        </nav>
        
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b border-border md:hidden">
            <div className="p-4 flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-water-deep transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/documents" 
                className="text-foreground hover:text-water-deep transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Documents
              </Link>
              <Link 
                to="/create" 
                className="text-foreground hover:text-water-deep transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Create New
              </Link>
              
              {user ? (
                <>
                  <div className="py-2 text-sm text-muted-foreground">
                    Signed in as: {user.email}
                  </div>
                  <Link
                    to="/account"
                    className="text-foreground hover:text-water-deep transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="inline-block mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
