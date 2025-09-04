import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { toggleDocumentSharing } from '@/lib/documents';
import { toast } from 'sonner';

interface DocumentShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    is_public?: boolean;
    share_token?: string;
    shared_at?: string;
  };
  onUpdate: (updates: { is_public: boolean; share_token?: string; shared_at?: string }) => void;
}

interface ShareResult {
  id: string;
  is_public: boolean;
  share_token: string;
  shared_at: string;
}

export function DocumentShareDialog({ open, onOpenChange, document, onUpdate }: DocumentShareDialogProps) {
  const [isPublic, setIsPublic] = useState(document.is_public || false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.share_token && document.is_public) {
      setShareUrl(`${window.location.origin}/shared/${document.share_token}`);
    } else {
      setShareUrl('');
    }
    setIsPublic(document.is_public || false);
  }, [document]);

  const handleToggleSharing = async (enabled: boolean) => {
    setLoading(true);
    try {
      const result = await toggleDocumentSharing(document.id, enabled) as unknown as ShareResult;
      
      setIsPublic(result.is_public);
      onUpdate({
        is_public: result.is_public,
        share_token: result.share_token,
        shared_at: result.shared_at
      });

      if (result.is_public && result.share_token) {
        setShareUrl(`${window.location.origin}/shared/${result.share_token}`);
        toast.success('Document sharing enabled');
      } else {
        setShareUrl('');
        toast.success('Document sharing disabled');
      }
    } catch (error: any) {
      console.error('Error toggling sharing:', error);
      toast.error(error.message || 'Failed to update sharing settings');
      setIsPublic(document.is_public || false); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Share "{document.title}" with others who can view it without signing in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Public Access</Label>
              <div className="text-sm text-muted-foreground">
                Allow anyone with the link to view this document
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggleSharing}
              disabled={loading}
            />
          </div>

          {/* Share URL Section */}
          {isPublic && shareUrl && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Globe className="h-4 w-4" />
                    Public Link
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="font-mono text-xs bg-background"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyUrl}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {document.shared_at && (
                    <div className="text-xs text-muted-foreground">
                      Shared on {new Date(document.shared_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Private State */}
          {!isPublic && (
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  This document is private and only visible to you
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isPublic && shareUrl && (
              <Button onClick={handleCopyUrl}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}