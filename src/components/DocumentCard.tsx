
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, Calendar } from 'lucide-react';

export type DocType = 'plan' | 'doctrine' | 'reflection';

export interface DocumentMeta {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  type?: DocType;
  content_type?: string;
  tags?: string[];
  lastEdited?: string;
  updated_at?: string;
  wordCount?: number;
  metadata?: any;
}

interface DocumentCardProps {
  document: DocumentMeta;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'plan':
        return 'bg-water hover:bg-water-deep';
      case 'doctrine':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'reflection':
        return 'bg-indigo-500 hover:bg-indigo-600';
      default:
        return 'bg-water hover:bg-water-deep';
    }
  };

  // Generate excerpt from content if not provided
  const excerpt = document.excerpt || (document.content ? document.content.substring(0, 150) + '...' : 'No content available');
  
  // Calculate word count if not provided
  const wordCount = document.wordCount || (document.content ? document.content.split(/\s+/).filter(Boolean).length : 0);
  
  // Format the date
  const lastEdited = document.lastEdited || (document.updated_at ? 
    new Date(document.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Unknown date');
  
  // Determine document type
  const docType = document.type || document.content_type;

  return (
    <Link to={`/documents/${document.id}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            {docType && (
              <Badge className={`${getTypeColor(docType)}`}>
                {docType.charAt(0).toUpperCase() + docType.slice(1)}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {lastEdited}
            </div>
          </div>
          <div className="font-serif font-medium text-xl mt-2 line-clamp-2">
            {document.title}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {document.tags && document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags && document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <File className="mr-1 h-3 w-3" />
            {wordCount} words
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DocumentCard;
