
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, File, Search, User, Folder, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const getNavLinkClass = (path: string) => {
    return pathname === path ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'hover:bg-secondary/50';
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="flex-none">
          <Logo size="small" />
        </Link>
        <div className="flex-1 flex justify-center">
          <ul className="flex space-x-1">
            <li>
              <Button variant="ghost" className={getNavLinkClass('/')} asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  <span>Home</span>
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className={getNavLinkClass('/documents')} asChild>
                <Link to="/documents">
                  <File className="h-4 w-4 mr-2" />
                  <span>Documents</span>
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className={getNavLinkClass('/folders')} asChild>
                <Link to="/folders">
                  <Folder className="h-4 w-4 mr-2" />
                  <span>Folders</span>
                </Link>
              </Button>
            </li>
          </ul>
        </div>
        <div className="flex-none">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
                    <AvatarFallback>{user?.user_metadata?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.user_metadata?.name || 'User'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <User className="h-4 w-4 mr-2" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
