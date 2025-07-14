import React, { useState, useEffect } from 'react';
import { Search, Filter, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilter {
  dateRange?: 'today' | 'week' | 'month' | 'year';
  documentType?: string;
  tags?: string[];
  contentType?: string;
  hasAI?: boolean;
  wordCountMin?: number;
  wordCountMax?: number;
}

interface AdvancedSearchProps {
  onResults: (results: any[]) => void;
  onFiltersChange: (filters: SearchFilter) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onResults, onFiltersChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading saved searches:', error);
    } else {
      setSavedSearches(data || []);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          document_tags(tag_name),
          document_analytics(action_type, created_at)
        `)
        .eq('is_deleted', false);

      // Text search
      if (searchQuery) {
        query = query.textSearch('search_vector', searchQuery);
      }

      // Date range filter
      if (filters.dateRange) {
        const now = new Date();
        const cutoff = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            cutoff.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoff.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoff.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoff.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('created_at', cutoff.toISOString());
      }

      // Document type filter
      if (filters.documentType) {
        query = query.eq('document_type', filters.documentType);
      }

      // Content type filter
      if (filters.contentType) {
        query = query.eq('content_type', filters.contentType);
      }

      // Word count filters
      if (filters.wordCountMin) {
        query = query.gte('word_count', filters.wordCountMin);
      }
      if (filters.wordCountMax) {
        query = query.lte('word_count', filters.wordCountMax);
      }

      // AI analysis filter
      if (filters.hasAI) {
        query = query.not('ai_analysis', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by tags if specified
      let results = data || [];
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(doc => {
          const docTags = doc.document_tags?.map((tag: any) => tag.tag_name) || [];
          return filters.tags!.some(tag => docTags.includes(tag));
        });
      }

      onResults(results);
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName,
          search_query: searchQuery,
          filters: filters as any
        });

      if (error) throw error;

      toast({
        title: "Search Saved",
        description: "Your search has been saved successfully"
      });

      setSaveDialogOpen(false);
      setSearchName('');
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Save Error",
        description: "Failed to save search",
        variant: "destructive"
      });
    }
  };

  const loadSavedSearch = (savedSearch: any) => {
    setSearchQuery(savedSearch.search_query);
    setFilters(savedSearch.filters || {});
    onFiltersChange(savedSearch.filters || {});
  };

  const updateFilter = (key: keyof SearchFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: keyof SearchFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search documents, content, titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Date Range</Label>
            <Select value={filters.dateRange || ''} onValueChange={(value) => updateFilter('dateRange', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Document Type</Label>
            <Select value={filters.documentType || ''} onValueChange={(value) => updateFilter('documentType', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Content Type</Label>
            <Select value={filters.contentType || ''} onValueChange={(value) => updateFilter('contentType', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All formats</SelectItem>
                <SelectItem value="text/plain">Plain Text</SelectItem>
                <SelectItem value="text/markdown">Markdown</SelectItem>
                <SelectItem value="text/html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Min Word Count</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.wordCountMin || ''}
              onChange={(e) => updateFilter('wordCountMin', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div>
            <Label>Max Word Count</Label>
            <Input
              type="number"
              placeholder="Unlimited"
              value={filters.wordCountMax || ''}
              onChange={(e) => updateFilter('wordCountMax', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAI"
              checked={filters.hasAI || false}
              onCheckedChange={(checked) => updateFilter('hasAI', checked || undefined)}
            />
            <Label htmlFor="hasAI">Has AI Analysis</Label>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {String(value)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(key as keyof SearchFilter)} />
              </Badge>
            ))}
          </div>
        )}

        {/* Save Search */}
        <div className="flex justify-between items-center">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    placeholder="Enter search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <Button onClick={saveSearch} disabled={!searchName.trim()}>
                  Save Search
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Select onValueChange={(value) => {
              const savedSearch = savedSearches.find(s => s.id === value);
              if (savedSearch) loadSavedSearch(savedSearch);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load saved search" />
              </SelectTrigger>
              <SelectContent>
                {savedSearches.map((search) => (
                  <SelectItem key={search.id} value={search.id}>
                    {search.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;