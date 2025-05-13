
import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { searchDocuments } from '@/lib/api';

interface DocumentLinkerProps {
  onSelect: (docId: string, title: string) => void;
  triggerText?: string;
}

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  content_type: string;
}

const DocumentLinker: React.FC<DocumentLinkerProps> = ({ 
  onSelect,
  triggerText = "Link to Document" 
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    
    // Debounce search to prevent too many requests
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchDocuments(searchTerm);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  const handleSelect = (docId: string, title: string) => {
    onSelect(docId, title);
    setOpen(false);
    setSearchTerm('');
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
        >
          <Link className="h-4 w-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-72">
        <Command>
          <div className="flex items-center border-b px-3">
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              autoFocus
            />
          </div>
          <CommandList>
            {isSearching && (
              <div className="py-6 text-center text-sm">
                Searching...
              </div>
            )}
            
            {!isSearching && results.length === 0 && searchTerm.length > 1 && (
              <div className="py-6 text-center text-sm">
                No documents found
              </div>
            )}
            
            {!isSearching && results.length === 0 && searchTerm.length <= 1 && (
              <div className="py-6 text-center text-sm">
                Type at least 2 characters to search
              </div>
            )}
            
            <CommandGroup>
              {results.map((doc) => (
                <CommandItem
                  key={doc.id}
                  onSelect={() => handleSelect(doc.id, doc.title)}
                  className="cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {doc.excerpt}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DocumentLinker;
