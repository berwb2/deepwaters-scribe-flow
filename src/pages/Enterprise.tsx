import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Search, FileTemplate, ArrowLeft, Home } from 'lucide-react';
import AdvancedSearch from '@/components/enterprise/AdvancedSearch';
import AnalyticsDashboard from '@/components/enterprise/AnalyticsDashboard';
import TemplateSystem from '@/components/enterprise/TemplateSystem';

const Enterprise: React.FC = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <MobileNav />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Enterprise Features</h1>
                <p className="text-sm text-muted-foreground">Advanced document management tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 container py-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Advanced Search
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileTemplate className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <AdvancedSearch onResults={setSearchResults} onFiltersChange={setSearchFilters} />
              
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results ({searchResults.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchResults.map((result: any) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">{result.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {result.content?.substring(0, 200)}...
                          </p>
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm">
                              <Link to={`/documents/${result.id}`}>View Document</Link>
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {result.word_count} words • {new Date(result.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="templates">
              <TemplateSystem />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;