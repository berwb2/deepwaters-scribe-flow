
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Logo from './Logo';
import { Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
          <Button asChild>
            <Link to="/start">
              Start Planning
            </Link>
          </Button>
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
              <Button 
                className="w-full" 
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/start">
                  Start Planning
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
