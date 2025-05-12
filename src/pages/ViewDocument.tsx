
import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TableOfContents from '@/components/TableOfContents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocType } from '@/components/DocumentCard';
import { ArrowLeft, Download, File, Info } from 'lucide-react';

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample document data
  const [document, setDocument] = useState<{
    id: string;
    title: string;
    content: string;
    type: DocType;
    tags: string[];
    lastEdited: string;
    formattedContent: string;
  } | null>(null);
  
  // Format the document content
  const formatContent = (content: string) => {
    // This is a simple formatter. In a real app, you'd use a more sophisticated formatter
    let formatted = content;
    
    // Format headings
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 id="$1">$1</h1>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>');
    
    // Format lists
    formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.+<\/li>)\n(<li>.+<\/li>)/g, '<ul>$1$2</ul>');
    
    // Format paragraphs (any line that's not a heading or list)
    formatted = formatted.replace(/^([^<\n].+)$/gm, '<p>$1</p>');
    
    return formatted;
  };
  
  // Load document data
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, you would fetch this from Supabase
    // Simulating API call with timeout
    setTimeout(() => {
      const sampleData = {
        id: id || '1',
        title: 'Strategic Business Plan 2025',
        type: 'plan' as DocType,
        tags: ['business', 'strategy', 'growth'],
        lastEdited: 'May 10, 2025',
        content: `# Strategic Business Plan 2025

## Executive Summary

This is a comprehensive five-year business strategy outlining growth targets, market positioning, and operational excellence initiatives.

## Market Analysis

### Current Market Position
Our company currently holds approximately 15% market share in our primary sector. Competitor analysis indicates opportunities for growth in emerging markets.

### Target Demographics
* Young professionals (25-40)
* Small to medium enterprises
* Tech-forward organizations

## Growth Strategy

### Revenue Targets
We aim to increase revenue by 30% over the next three years through the following initiatives:

* Expansion into international markets
* Development of subscription-based service models
* Strategic acquisitions in complementary sectors

### Product Development
Our product roadmap prioritizes innovation in three key areas:

1. AI-enhanced customer experiences
2. Sustainability features
3. Integration capabilities with emerging technologies

## Operational Excellence

### Team Structure
As we scale, our organizational structure will evolve to support:

* Cross-functional product teams
* Dedicated innovation department
* Enhanced customer success operations

### Key Performance Indicators
We will measure success through:

* Customer lifetime value
* Retention metrics
* Innovation output
* Operational efficiency

## Risk Assessment

### Market Risks
* Economic downturn scenarios
* Competitive disruption
* Regulatory changes

### Mitigation Strategies
Maintaining financial flexibility and diversifying revenue streams will be key to navigating potential market challenges.

## Financial Projections

### Five-Year Forecast
Based on our growth initiatives and market analysis, we project:

* Year 1: 15% growth
* Year 2: 22% growth
* Year 3: 30% growth
* Year 4: 28% growth
* Year 5: 25% growth

## Implementation Timeline

### Phase One (2025)
Focus on strengthening core offerings and establishing operational foundations for growth.

### Phase Two (2026-2027)
Accelerate market expansion and launch key innovation initiatives.

### Phase Three (2028-2030)
Scale successful operations and pursue strategic acquisition opportunities.

## Conclusion

This strategic plan provides a framework for sustainable growth while maintaining our commitment to innovation and customer value. Regular quarterly reviews will ensure we remain adaptable to changing market conditions.`
      };
      
      setDocument({
        ...sampleData,
        formattedContent: formatContent(sampleData.content)
      });
      
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-medium mb-2">Document Not Found</h1>
            <p className="text-muted-foreground mb-6">The document you're looking for doesn't exist or has been moved.</p>
            <Button asChild>
              <Link to="/documents">Back to Documents</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link to="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            
            <Badge className="mr-2">
              {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
            </Badge>
            
            <span className="text-sm text-muted-foreground ml-auto">
              Last edited: {document.lastEdited}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Table of Contents (sidebar) */}
            <TableOfContents contentRef={contentRef} />
            
            {/* Document content */}
            <div className="flex-1">
              <div className="mb-6 pb-6 border-b">
                <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">{document.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div 
                ref={contentRef}
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: document.formattedContent }}
              />
              
              <div className="mt-12 pt-6 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <span>{document.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ViewDocument;
