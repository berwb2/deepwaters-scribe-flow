/**
 * Main sharing module entry point
 * Provides a clean API for all sharing functionality
 */

// Export all types
export * from './types';

// Export utilities
export * from './utils';

// Export permission utilities
export * from './permissions';

// Export document sharing
export * from './documents';

// Export comment functionality  
export * from './comments';

// Export folder sharing (when implemented)
// export * from './folders';

// Export change tracking (when implemented)
// export * from './changes';

// Re-export legacy functions for backward compatibility
// These can be removed in a future version
export {
  shareDocumentWithUser,
  getDocumentShares,
  updateDocumentShare,
  removeDocumentShare,
  copyDocumentToWorkspace,
  bulkShareDocument,
  removeAllDocumentShares,
  getDocumentSharingStats
} from './documents';

export {
  getDocumentComments,
  createComment,
  updateComment,
  resolveComment,
  deleteComment,
  getCommentStats,
  searchDocumentComments,
  bulkResolveComments
} from './comments';

export { getUserDocumentPermission } from './permissions';