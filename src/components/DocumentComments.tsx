import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentComment, getDocumentComments, createComment, resolveComment, deleteComment } from '@/lib/sharing';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Check, X, Reply, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DocumentCommentsProps {
  documentId: string;
  canComment: boolean;
}

export default function DocumentComments({ documentId, canComment }: DocumentCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = async () => {
    try {
      const data = await getDocumentComments(documentId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const handleCreateComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const comment = await createComment(documentId, newComment.trim());
      setComments(prev => [...prev, { ...comment, replies: [] }]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleCreateReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const reply = await createComment(documentId, replyContent.trim(), undefined, undefined, undefined, parentId);
      
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added');
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to add reply');
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
      toast.success(isResolved ? 'Comment resolved' : 'Comment reopened');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Comments ({comments.length})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment */}
        {canComment && user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleCreateComment}
              disabled={!newComment.trim()}
              className="w-full sm:w-auto"
            >
              Add Comment
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet</p>
            {canComment && <p className="text-sm">Be the first to add a comment!</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
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
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
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
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreateReply(comment.id)}
                            disabled={!replyContent.trim()}
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
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
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
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