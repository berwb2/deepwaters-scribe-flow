
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import DocumentCard, { DocumentMeta } from '@/components/DocumentCard';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Documents = () => {
  // Sample data for demonstration
  const sampleDocuments: DocumentMeta[] = [
    {
      id: '1',
      title: 'Strategic Business Plan 2025',
      excerpt: 'A comprehensive five-year business strategy outlining growth targets, market positioning, and operational excellence initiatives.',
      type: 'plan',
      tags: ['business', 'strategy', 'growth'],
      lastEdited: 'May 10, 2025',
      wordCount: 3240
    },
    {
      id: '2',
      title: 'Company Core Values and Mission',
      excerpt: 'Our fundamental beliefs and guiding principles that define our company culture, shape decisions, and reflect our mission.',
      type: 'doctrine',
      tags: ['values', 'culture', 'mission'],
      lastEdited: 'April 28, 2025',
      wordCount: 2180
    },
    {
      id: '3',
      title: 'Q1 Performance Review & Reflection',
      excerpt: 'An analysis of first quarter results, challenges faced, lessons learned, and adjustments needed for future quarters.',
      type: 'reflection',
      tags: ['review', 'quarterly', 'performance'],
      lastEdited: 'April 15, 2025',
      wordCount: 4120
    },
    {
      id: '4',
      title: 'Product Roadmap 2025-2026',
      excerpt: 'Detailed timeline for product development, feature releases, and technology investments over the next 18 months.',
      type: 'plan',
      tags: ['product', 'roadmap', 'development'],
      lastEdited: 'May 2, 2025',
      wordCount: 2850
    },
    {
      id: '5',
      title: 'Team Leadership Philosophy',
      excerpt: 'Core principles for effective team leadership, motivation strategies, and creating an environment for peak performance.',
      type: 'doctrine',
      tags: ['leadership', 'management', 'teams'],
      lastEdited: 'March 20, 2025',
      wordCount: 3680
    }
  ];

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  
  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === null || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2">My Documents</h1>
            <p className="text-muted-foreground">Browse and manage your plans, doctrines, and reflections</p>
          </div>
          
          <Button className="mt-4 md:mt-0" asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Document
            </Link>
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedType === null ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => setSelectedType(null)}
              >
                All
              </Badge>
              <Badge 
                variant={selectedType === 'plan' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => setSelectedType('plan')}
              >
                Plans
              </Badge>
              <Badge 
                variant={selectedType === 'doctrine' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => setSelectedType('doctrine')}
              >
                Doctrines
              </Badge>
              <Badge 
                variant={selectedType === 'reflection' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => setSelectedType('reflection')}
              >
                Reflections
              </Badge>
            </div>
          </div>
        </div>
        
        {filteredDocuments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-2">No documents found</div>
            <p className="text-muted-foreground mb-6">Try adjusting your search or create a new document</p>
            <Button asChild>
              <Link to="/create">
                <Plus className="mr-2 h-4 w-4" /> Create New Document
              </Link>
            </Button>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Documents;
