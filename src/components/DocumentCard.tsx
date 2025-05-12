
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File } from 'lucide-react';

export type DocType = 'plan' | 'doctrine' | 'reflection';

export interface DocumentMeta {
  id: string;
  title: string;
  excerpt: string;
  type: DocType;
  tags: string[];
  lastEdited: string;
  wordCount: number;
}

interface DocumentCardProps {
  document: DocumentMeta;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getTypeColor = (type: DocType) => {
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

  return (
    <Link to={`/documents/${document.id}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Badge className={`${getTypeColor(document.type)}`}>
              {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {document.lastEdited}
            </div>
          </div>
          <div className="font-serif font-medium text-xl mt-2 line-clamp-2">
            {document.title}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground line-clamp-3">
            {document.excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {document.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <File className="mr-1 h-3 w-3" />
            {document.wordCount} words
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DocumentCard;
