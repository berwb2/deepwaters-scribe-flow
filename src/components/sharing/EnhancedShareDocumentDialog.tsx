/**
 * Enhanced Share Document Dialog
 * Production-ready sharing interface with bulk operations and improved UX
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DocumentShare,
  ShareInvitation,
  BulkShareResult,
  PermissionLevel,
  shareDocumentWithUser,
  bulkShareDocument,
  getDocumentShares,
  updateDocumentShare,
  removeDocumentShare,
  removeAllDocumentShares,
  getDocumentSharingStats,
  getUserDocumentPermission,
  copyDocumentToWorkspace
} from '@/lib/sharing';
import { toggleDocumentSharing } from '@/lib/documents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Download, 
  Link2, 
  Share2, 
  UserPlus, 
  Users2,
  X, 
  Globe, 
  Lock, 
  Users,
  Plus,
  Trash2,
  BarChart3,
  Mail
} from 'lucide-react';
import { copyToClipboard, generateShareLink, isValidEmail } from '@/lib/sharing/utils';
import { toast } from 'sonner';

interface EnhancedShareDocumentDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  document: {
    title: string;
    is_public: boolean;
    share_token?: string;
  };
}

export default function EnhancedShareDocumentDialog({ 
  documentId, 
  isOpen, 
  onClose, 
  document 
}: EnhancedShareDocumentDialogProps) {
  const { user } = useAuth();
  
  // State management
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(document.is_public);
  const [userPermission, setUserPermission] = useState<string>('none');
  const [stats, setStats] = useState({
    total_shares: 0,
    view_permissions: 0,
    comment_permissions: 0,
    edit_permissions: 0,
    is_public: false,
    created_at: ''
  });

  // Single share form
  const [userEmail, setUserEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('view');

  // Bulk share form
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkPermission, setBulkPermission] = useState<PermissionLevel>('view');
  const [bulkMessage, setBulkMessage] = useState('');

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen && documentId) {
      fetchData();
    }
  }, [isOpen, documentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchShares(),
        checkUserPermission(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShares = async () => {
    try {
      const data = await getDocumentShares(documentId);
      setShares(data);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast.error('Failed to load sharing settings');
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

  const fetchStats = async () => {
    try {
      const statsData = await getDocumentSharingStats(documentId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleShareWithUser = async () => {
    if (!userEmail.trim()) {
      toast.error('Please enter a user email');
      return;
    }

    if (!isValidEmail(userEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      await shareDocumentWithUser(documentId, userEmail.trim(), permissionLevel);
      setUserEmail('');
      await fetchData();
      toast.success('Document shared successfully');
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast.error(error.message || 'Failed to share document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkShare = async () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter email addresses');
      return;
    }

    const emails = bulkEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    const invitations: ShareInvitation[] = emails.map(email => ({
      email,
      permission_level: bulkPermission
    }));

    try {
      setSubmitting(true);
      const result: BulkShareResult = await bulkShareDocument(documentId, invitations);
      
      if (result.success.length > 0) {
        toast.success(`Successfully shared with ${result.success.length} user(s)`);
      }
      
      if (result.failed.length > 0) {
        toast.error(`Failed to share with ${result.failed.length} user(s)`);
        console.error('Failed shares:', result.failed);
      }

      setBulkEmails('');
      setBulkMessage('');
      await fetchData();
    } catch (error: any) {
      console.error('Error bulk sharing:', error);
      toast.error(error.message || 'Failed to share document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: PermissionLevel) => {
    try {
      await updateDocumentShare(shareId, newPermission);
      setShares(prev => prev.map(share => 
        share.id === shareId 
          ? { ...share, permission_level: newPermission }
          : share
      ));
      await fetchStats();
      toast.success('Permission updated');
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast.error(error.message || 'Failed to update permission');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeDocumentShare(shareId);
      setShares(prev => prev.filter(share => share.id !== shareId));
      await fetchStats();
      toast.success('Share removed');
    } catch (error: any) {
      console.error('Error removing share:', error);
      toast.error(error.message || 'Failed to remove share');
    }
  };

  const handleRemoveAllShares = async () => {
    try {
      const removedCount = await removeAllDocumentShares(documentId);
      setShares([]);
      await fetchStats();
      toast.success(`Removed ${removedCount} share(s)`);
    } catch (error: any) {
      console.error('Error removing all shares:', error);
      toast.error(error.message || 'Failed to remove shares');
    }
  };

  const handleTogglePublic = async () => {
    try {
      const result = await toggleDocumentSharing(documentId, !isPublic);
      if (result && typeof result === 'object' && 'is_public' in result) {
        const isPublicResult = result.is_public as boolean;
        setIsPublic(isPublicResult);
        await fetchStats();
        toast.success(isPublicResult ? 'Document is now public' : 'Document is now private');
      }
    } catch (error: any) {
      console.error('Error toggling public sharing:', error);
      toast.error(error.message || 'Failed to update sharing settings');
    }
  };

  const handleCopyToWorkspace = async () => {
    try {
      const newDocId = await copyDocumentToWorkspace(documentId);
      toast.success('Document copied to your workspace!');
      onClose();
    } catch (error: any) {
      console.error('Error copying document:', error);
      toast.error(error.message || 'Failed to copy document');
    }
  };

  const copyShareLink = async () => {
    if (document.share_token) {
      const shareUrl = generateShareLink(document.share_token);
      const success = await copyToClipboard(shareUrl);
      if (success) {
        toast.success('Share link copied to clipboard');
      } else {
        toast.error('Failed to copy link');
      }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{document.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="manage">Manage ({shares.length})</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-6 mt-6">
              {/* Public sharing toggle */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPublic ? (
                        <Globe className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {isPublic ? 'Public Access' : 'Private Document'}
                        </CardTitle>
                        <CardDescription>
                          {isPublic 
                            ? 'Anyone with the link can view this document'
                            : 'Only shared users can access this document'
                          }
                        </CardDescription>
                      </div>
                    </div>
                    {userPermission === 'owner' && (
                      <Button
                        variant={isPublic ? "default" : "outline"}
                        onClick={handleTogglePublic}
                        disabled={loading}
                      >
                        {isPublic ? 'Make Private' : 'Make Public'}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {/* Share link */}
                {isPublic && document.share_token && (
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={generateShareLink(document.share_token)}
                        className="flex-1 font-mono text-sm"
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
                  </CardContent>
                )}
              </Card>

              {/* Copy to workspace - for non-owners */}
              {userPermission !== 'owner' && userPermission !== 'none' && user && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-base">Copy to Your Workspace</CardTitle>
                          <CardDescription>
                            Create a personal copy of this document
                          </CardDescription>
                        </div>
                      </div>
                      <Button onClick={handleCopyToWorkspace}>
                        <Download className="h-4 w-4 mr-2" />
                        Copy Document
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {/* Share with specific users - owner only */}
              {userPermission === 'owner' && (
                <>
                  <Separator />
                  
                  <div className="space-y-6">
                    {/* Single user share */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <UserPlus className="h-5 w-5" />
                          Share with a user
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter user email..."
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="flex-1"
                            disabled={submitting}
                          />
                          <Select 
                            value={permissionLevel} 
                            onValueChange={(value: PermissionLevel) => setPermissionLevel(value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={handleShareWithUser} 
                            disabled={loading || submitting || !userEmail.trim()}
                          >
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bulk share */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Mail className="h-5 w-5" />
                          Bulk share
                        </CardTitle>
                        <CardDescription>
                          Share with multiple users at once (one email per line or comma-separated)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
                          value={bulkEmails}
                          onChange={(e) => setBulkEmails(e.target.value)}
                          className="min-h-[100px]"
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Select 
                            value={bulkPermission} 
                            onValueChange={(value: PermissionLevel) => setBulkPermission(value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={handleBulkShare} 
                            disabled={loading || submitting || !bulkEmails.trim()}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Share with All
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 mt-6">
              {shares.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No shares yet</p>
                  <p className="text-sm">Share this document to see users here</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Shared with {shares.length} user(s)</span>
                    </div>
                    {userPermission === 'owner' && shares.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAllShares}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove All
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <Card key={share.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={share.shared_with_profile?.avatar_url} />
                                <AvatarFallback>
                                  {share.shared_with_profile?.display_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {share.shared_with_profile?.display_name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {share.shared_with}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Shared {new Date(share.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={getPermissionBadgeVariant(share.permission_level)}>
                                {share.permission_level}
                              </Badge>
                            </div>
                            
                            {userPermission === 'owner' && (
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={share.permission_level} 
                                  onValueChange={(value: PermissionLevel) => handleUpdatePermission(share.id, value)}
                                >
                                  <SelectTrigger className="w-28">
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
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sharing Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{stats.total_shares}</div>
                      <div className="text-sm text-muted-foreground">Total Shares</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{stats.view_permissions}</div>
                      <div className="text-sm text-muted-foreground">View Only</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{stats.comment_permissions}</div>
                      <div className="text-sm text-muted-foreground">Can Comment</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{stats.edit_permissions}</div>
                      <div className="text-sm text-muted-foreground">Can Edit</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Public Access:</span>
                      <Badge variant={stats.is_public ? "default" : "secondary"}>
                        {stats.is_public ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {stats.created_at && (
                      <div className="flex justify-between">
                        <span>Document Created:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(stats.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}