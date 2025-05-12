
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Wave from "@/components/Wave";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center relative px-4 py-12">
        <Wave position="top" className="absolute top-0 left-0 right-0" />
        
        <div className="water-card p-8 md:p-12 max-w-md w-full text-center">
          <Logo className="mx-auto mb-6" />
          
          <div className="relative mb-8">
            <div className="text-8xl font-serif font-medium text-water-deep">404</div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-water/30 to-transparent"></div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-medium mb-4">Page Not Found</h1>
          <p className="text-neutral-dark mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
        
        <Wave position="bottom" className="absolute bottom-0 left-0 right-0" />
      </div>
    </div>
  );
};

export default NotFound;
