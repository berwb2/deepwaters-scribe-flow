import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  shareDocumentWithUser, 
  getDocumentShares, 
  updateDocumentShare, 
  removeDocumentShare,
  DocumentShare,
  getUserDocumentPermission,
  copyDocumentToWorkspace
} from '@/lib/sharing';
import { toggleDocumentSharing } from '@/lib/documents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, Link2, Share2, UserPlus, X, Globe, Lock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ShareDocumentAdvancedProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  document: {
    title: string;
    is_public: boolean;
    share_token?: string;
  };
}

export default function ShareDocumentAdvanced({ 
  documentId, 
  isOpen, 
  onClose, 
  document 
}: ShareDocumentAdvancedProps) {
  const { user } = useAuth();
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [isPublic, setIsPublic] = useState(document.is_public);
  const [userPermission, setUserPermission] = useState<string>('none');

  useEffect(() => {
    if (isOpen && documentId) {
      fetchShares();
      checkUserPermission();
    }
  }, [isOpen, documentId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const data = await getDocumentShares(documentId);
      setShares(data);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast.error('Failed to load sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermission = async () => {
    if (user) {
      try {
        const permission = await getUserDocumentPermission(documentId);
        setUserPermission(permission);
      } catch (error) {
        console.error('Error checking permission:', error);
      }
    }
  };

  const handleShareWithUser = async () => {
    if (!userEmail.trim()) {
      toast.error('Please enter a user email');
      return;
    }

    try {
      await shareDocumentWithUser(documentId, userEmail.trim(), permissionLevel);
      setUserEmail('');
      await fetchShares();
      toast.success('Document shared successfully');
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document. User may not exist.');
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: 'view' | 'comment' | 'edit') => {
    try {
      await updateDocumentShare(shareId, newPermission);
      setShares(prev => prev.map(share => 
        share.id === shareId 
          ? { ...share, permission_level: newPermission }
          : share
      ));
      toast.success('Permission updated');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeDocumentShare(shareId);
      setShares(prev => prev.filter(share => share.id !== shareId));
      toast.success('Share removed');
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('Failed to remove share');
    }
  };

  const handleTogglePublic = async () => {
    try {
      const result = await toggleDocumentSharing(documentId, !isPublic);
      if (result && typeof result === 'object' && 'is_public' in result) {
        const isPublicResult = result.is_public as boolean;
        setIsPublic(isPublicResult);
        toast.success(isPublicResult ? 'Document is now public' : 'Document is now private');
      }
    } catch (error) {
      console.error('Error toggling public sharing:', error);
      toast.error('Failed to update sharing settings');
    }
  };

  const handleCopyToWorkspace = async () => {
    try {
      const newDocId = await copyDocumentToWorkspace(documentId);
      toast.success('Document copied to your workspace!');
      onClose();
    } catch (error) {
      console.error('Error copying document:', error);
      toast.error('Failed to copy document');
    }
  };

  const copyShareLink = () => {
    if (document.share_token) {
      const shareUrl = `${window.location.origin}/shared/${document.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    }
  };

  const getPermissionBadgeVariant = (permission: string) => {
    switch (permission) {
      case 'edit': return 'default';
      case 'comment': return 'secondary';
      case 'view': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{document.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public sharing toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-blue-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <h4 className="font-medium">
                  {isPublic ? 'Public Access' : 'Private Document'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isPublic 
                    ? 'Anyone with the link can view this document'
                    : 'Only shared users can access this document'
                  }
                </p>
              </div>
            </div>
            {userPermission === 'owner' && (
              <Button
                variant={isPublic ? "default" : "outline"}
                onClick={handleTogglePublic}
              >
                {isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            )}
          </div>

          {/* Share link */}
          {isPublic && document.share_token && (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/shared/${document.share_token}`}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyShareLink}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Copy to workspace - for non-owners */}
          {userPermission !== 'owner' && userPermission !== 'none' && user && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Copy to Your Workspace</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a personal copy of this document
                  </p>
                </div>
              </div>
              <Button onClick={handleCopyToWorkspace}>
                <Download className="h-4 w-4 mr-2" />
                Copy Document
              </Button>
            </div>
          )}

          {/* Share with specific users - owner only */}
          {userPermission === 'owner' && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  <h3 className="font-medium">Share with specific users</h3>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter user email..."
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={permissionLevel} onValueChange={(value: any) => setPermissionLevel(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleShareWithUser} disabled={loading}>
                    Share
                  </Button>
                </div>
              </div>

              {/* Current shares */}
              {shares.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h3 className="font-medium">Shared with ({shares.length})</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={share.shared_with_profile?.avatar_url} />
                            <AvatarFallback>
                              {share.shared_with_profile?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {share.shared_with_profile?.display_name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {share.shared_with}
                            </p>
                          </div>
                          <Badge variant={getPermissionBadgeVariant(share.permission_level)}>
                            {share.permission_level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select 
                            value={share.permission_level} 
                            onValueChange={(value: any) => handleUpdatePermission(share.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveShare(share.id)}
                            title="Remove access"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}