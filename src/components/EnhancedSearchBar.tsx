import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import SearchService, { SearchFilters, SearchResults } from '@/services/searchService';
import { Search, Loader2, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedSearchBarProps {
  onSearchResults: (results: SearchResults) => void;
  filters?: SearchFilters;
  placeholder?: string;
  className?: string;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearchResults,
  filters = {},
  placeholder = "Search documents, files, and content...",
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(filters);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (searchQuery.trim() || Object.keys(searchFilters).length > 0) {
      setIsSearching(true);
      try {
        const results = await SearchService.searchDocuments(searchQuery, searchFilters);
        onSearchResults(results);
        
        // Get suggestions for autocomplete if there's a query
        if (searchQuery.trim()) {
          const suggestionResults = await SearchService.getSearchSuggestions(searchQuery);
          setSuggestions(suggestionResults);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      onSearchResults({ documents: [], fileMatches: [], totalResults: 0 });
      setSuggestions([]);
    }
  }, 300);
  
  useEffect(() => {
    debouncedSearch(query, activeFilters);
  }, [query, activeFilters]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };
  
  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setActiveFilters(prev => {
      if (value === undefined || value === '') {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };
  
  const clearAllFilters = () => {
    setActiveFilters({});
    setQuery('');
  };
  
  const activeFilterCount = Object.keys(activeFilters).length;
  
  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={searchRef}>
      <div className="flex space-x-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
          
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Filter Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Search Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                  <Select
                    value={activeFilters.document_type || ''}
                    onValueChange={(value) => updateFilter('document_type', value || undefined)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Date From</label>
                  <Input
                    type="date"
                    value={activeFilters.date_from || ''}
                    onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                    className="h-8 text-xs"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Date To</label>
                  <Input
                    type="date"
                    value={activeFilters.date_to || ''}
                    onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {activeFilters.document_type && (
            <Badge variant="secondary" className="text-xs">
              Type: {activeFilters.document_type}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('document_type', undefined)}
              />
            </Badge>
          )}
          {activeFilters.date_from && (
            <Badge variant="secondary" className="text-xs">
              From: {activeFilters.date_from}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('date_from', undefined)}
              />
            </Badge>
          )}
          {activeFilters.date_to && (
            <Badge variant="secondary" className="text-xs">
              To: {activeFilters.date_to}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('date_to', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;