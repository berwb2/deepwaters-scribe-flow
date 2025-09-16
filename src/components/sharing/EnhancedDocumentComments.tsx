/**
 * Enhanced Document Comments Component
 * Production-ready component with improved UX, performance, and features
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DocumentComment, 
  CommentFilter,
  getDocumentComments, 
  createComment, 
  resolveComment, 
  deleteComment,
  getCommentStats,
  searchDocumentComments,
  bulkResolveComments
} from '@/lib/sharing';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Check, 
  X, 
  Reply, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { formatRelativeTime, debounce } from '@/lib/sharing/utils';
import { toast } from 'sonner';

interface EnhancedDocumentCommentsProps {
  documentId: string;
  canComment: boolean;
  className?: string;
}

export default function EnhancedDocumentComments({ 
  documentId, 
  canComment,
  className = ""
}: EnhancedDocumentCommentsProps) {
  const { user } = useAuth();
  
  // State management
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [showResolved, setShowResolved] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [stats, setStats] = useState({
    total_comments: 0,
    total_replies: 0,
    resolved_comments: 0,
    unresolved_comments: 0
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        performSearch(term);
      } else {
        fetchComments();
      }
    }, 300),
    [documentId]
  );

  // Filtered comments based on current filters
  const filteredComments = useMemo(() => {
    let filtered = comments;
    
    if (showResolved === 'resolved') {
      filtered = filtered.filter(c => c.is_resolved);
    } else if (showResolved === 'unresolved') {
      filtered = filtered.filter(c => !c.is_resolved);
    }
    
    return filtered;
  }, [comments, showResolved]);

  // Load initial data
  useEffect(() => {
    if (documentId) {
      fetchComments();
      fetchStats();
    }
  }, [documentId]);

  // Handle search
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const filter: CommentFilter = {};
      
      if (showResolved === 'resolved') {
        filter.resolved = true;
      } else if (showResolved === 'unresolved') {
        filter.resolved = false;
      }
      
      const data = await getDocumentComments(documentId, filter);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getCommentStats(documentId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching comment stats:', error);
    }
  };

  const performSearch = async (term: string) => {
    try {
      setLoading(true);
      const results = await searchDocumentComments(documentId, term);
      setComments(results);
    } catch (error) {
      console.error('Error searching comments:', error);
      toast.error('Failed to search comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !user || submitting) return;

    try {
      setSubmitting(true);
      const comment = await createComment(documentId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      await fetchStats();
      toast.success('Comment added');
    } catch (error: any) {
      console.error('Error creating comment:', error);
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReply = async (parentId: string) => {
    if (!replyContent.trim() || !user || submitting) return;

    try {
      setSubmitting(true);
      const reply = await createComment(
        documentId, 
        replyContent.trim(), 
        undefined, 
        undefined, 
        undefined, 
        parentId
      );
      
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      await fetchStats();
      toast.success('Reply added');
    } catch (error: any) {
      console.error('Error creating reply:', error);
      toast.error(error.message || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveComment = async (commentId: string, isResolved: boolean) => {
    try {
      await resolveComment(commentId, isResolved);
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, is_resolved: isResolved }
          : comment
      ));
      await fetchStats();
      toast.success(isResolved ? 'Comment resolved' : 'Comment reopened');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast.error(error.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setSelectedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      await fetchStats();
      toast.success('Comment deleted');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleBulkResolve = async (resolved: boolean) => {
    if (selectedComments.size === 0) return;
    
    try {
      const commentIds = Array.from(selectedComments);
      const results = await bulkResolveComments(commentIds, resolved);
      
      if (results.success.length > 0) {
        setComments(prev => prev.map(comment => 
          results.success.includes(comment.id)
            ? { ...comment, is_resolved: resolved }
            : comment
        ));
        await fetchStats();
        toast.success(`${results.success.length} comments ${resolved ? 'resolved' : 'reopened'}`);
      }
      
      if (results.failed.length > 0) {
        toast.error(`Failed to update ${results.failed.length} comments`);
      }
      
      setSelectedComments(new Set());
    } catch (error) {
      console.error('Error bulk resolving comments:', error);
      toast.error('Failed to update comments');
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedComments(new Set());
  };

  if (loading && comments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Comments</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">
                Comments ({stats.total_comments})
              </span>
            </div>
            
            {stats.unresolved_comments > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.unresolved_comments} unresolved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-48"
              />
            </div>

            {/* Filter */}
            <Select value={showResolved} onValueChange={(value: any) => setShowResolved(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedComments.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm">
              {selectedComments.size} comment{selectedComments.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkResolve(true)}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkResolve(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Reopen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {canComment && user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/10000 characters
              </span>
              <Button 
                onClick={handleCreateComment}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            {searchTerm ? (
              <p>No comments found for "{searchTerm}"</p>
            ) : (
              <>
                <p>No comments yet</p>
                {canComment && <p className="text-sm">Be the first to add a comment!</p>}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
                  {/* Selection checkbox */}
                  <div className="flex items-start pt-1">
                    <Checkbox
                      checked={selectedComments.has(comment.id)}
                      onCheckedChange={() => toggleCommentSelection(comment.id)}
                    />
                  </div>

                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user_profile?.avatar_url} />
                    <AvatarFallback>
                      {comment.user_profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {comment.user_profile?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {comment.is_resolved && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      {canComment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          disabled={submitting}
                          className="h-auto p-1 text-xs"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      )}
                      
                      {user && (comment.user_id === user.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveComment(comment.id, !comment.is_resolved)}
                            className="h-auto p-1 text-xs"
                          >
                            {comment.is_resolved ? (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Reopen
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Resolve
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="space-y-2 ml-4 border-l-2 border-muted pl-4">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px]"
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreateReply(comment.id)}
                            disabled={!replyContent.trim() || submitting}
                          >
                            {submitting ? 'Replying...' : 'Reply'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 space-y-3">
                        <Separator />
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={reply.user_profile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {reply.user_profile?.display_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs">
                                  {reply.user_profile?.display_name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(reply.created_at)}
                                </span>
                              </div>
                              
                              <div className="bg-muted/20 rounded-md p-2">
                                <p className="text-xs whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}