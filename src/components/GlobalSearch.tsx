
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, File, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { searchDocuments } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  content_type: string;
}

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Handle debouncing search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Fetch search results
  const { data: results, isLoading } = useQuery({
    queryKey: ['document-search', debouncedQuery],
    queryFn: () => searchDocuments(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
  
  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      // Escape to close search
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Focus input when search is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  // Navigate to document and close search
  const handleSelectResult = (id: string) => {
    navigate(`/documents/${id}`);
    setIsOpen(false);
    setQuery('');
  };
  
  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    try {
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={index} className="bg-water/20 font-medium">{part}</span> 
          : part
      );
    } catch (e) {
      return text;
    }
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <Button 
        variant="outline" 
        className="gap-2 w-[240px] justify-between" 
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Search documents...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-[550px] max-w-[calc(100vw-2rem)] right-0 bg-popover border rounded-md shadow-md z-50">
          <div className="flex items-center p-2 border-b">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input 
              ref={inputRef}
              placeholder="Search documents..." 
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {debouncedQuery.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto p-2">
              {isLoading ? (
                <div className="py-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-water" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button 
                      key={result.id} 
                      className="w-full flex items-start space-x-2 p-2 hover:bg-accent rounded-md text-left"
                      onClick={() => handleSelectResult(result.id)}
                    >
                      <File className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">{highlightMatch(result.title, query)}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {highlightMatch(result.excerpt, query)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No results found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Type to start searching...</p>
            </div>
          )}
          
          <div className="p-2 bg-muted/50 border-t text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Press <kbd className="px-1 rounded bg-background">↑</kbd> <kbd className="px-1 rounded bg-background">↓</kbd> to navigate</span>
              <span>Press <kbd className="px-1 rounded bg-background">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
