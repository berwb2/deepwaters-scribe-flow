
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import CreateDocument from "./pages/CreateDocument";
import ViewDocument from "./pages/ViewDocument";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AccountSettings from "./pages/AccountSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Redirect route component - redirects authenticated users away from login pages
const RedirectIfAuth = ({ children }: { children: JSX.Element }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin"></div>
    </div>;
  }
  
  if (user) {
    // Redirect to dashboard if authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<ViewDocument />} />
          <Route path="/create" element={
            <RequireAuth>
              <CreateDocument />
            </RequireAuth>
          } />
          <Route path="/start" element={
            <RequireAuth>
              <CreateDocument />
            </RequireAuth>
          } />
          <Route path="/account" element={
            <RequireAuth>
              <AccountSettings />
            </RequireAuth>
          } />
          <Route path="/login" element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          } />
          <Route path="/reset-password" element={
            <RedirectIfAuth>
              <ResetPassword />
            </RedirectIfAuth>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
