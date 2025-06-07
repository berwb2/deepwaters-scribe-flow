import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import { SoundProvider, useSound } from './contexts/SoundContext';

import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Documents from './pages/Documents';
import CreateDocument from './pages/CreateDocument';
import ViewDocument from './pages/ViewDocument';
import AccountSettings from './pages/AccountSettings';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Folders from './pages/Folders';
import FolderView from './pages/FolderView';
import Calendar from './pages/Calendar';
import Books from './pages/Books';
import GrandStrategist from './pages/GrandStrategist';

// Component that plays the welcome sound
function AppWithSound() {
  const { playSound } = useSound();
  
  // Play wave sound when app loads
  useEffect(() => {
    playSound('wave');
  }, []);
  
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/create" element={<CreateDocument />} />
        <Route path="/documents/:id" element={<ViewDocument />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folders/:id" element={<FolderView />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/books" element={<Books />} />
        <Route path="/grand-strategist" element={<GrandStrategist />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
}

function App() {
  const queryClient = new QueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="deepwaters-theme">
            <SoundProvider>
              <Toaster />
              <AppWithSound />
            </SoundProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
