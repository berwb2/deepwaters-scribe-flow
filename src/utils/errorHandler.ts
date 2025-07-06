import { toast } from '@/components/ui/sonner';

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ErrorResponse | SuccessResponse<T>;

export const handleApiError = (error: any, context = ''): ErrorResponse => {
  console.error(`API Error in ${context}:`, error);
  
  let message = 'An unexpected error occurred';
  let code = 'UNKNOWN_ERROR';
  
  // Handle different error types
  if (error?.message) {
    message = error.message;
    code = error.code || 'API_ERROR';
  } else if (error?.error?.message) {
    message = error.error.message;
    code = error.error.code || 'API_ERROR';
  } else if (typeof error === 'string') {
    message = error;
    code = 'STRING_ERROR';
  } else if (error?.details) {
    message = error.details;
    code = error.code || 'DETAILS_ERROR';
  }
  
  // Handle specific Supabase errors
  if (error?.code === 'PGRST116') {
    message = 'Resource not found';
    code = 'NOT_FOUND';
  } else if (error?.code === '23505') {
    message = 'This item already exists';
    code = 'DUPLICATE_ERROR';
  } else if (error?.code === '42501') {
    message = 'You do not have permission to perform this action';
    code = 'PERMISSION_DENIED';
  } else if (error?.code === 'AUTH_ERROR') {
    message = 'Please log in to continue';
    code = 'AUTH_ERROR';
  }
  
  // Show user-friendly error message
  toast.error(message);
  
  // Log to monitoring service
  logError(error, context, code);
  
  return { success: false, error: message, code };
};

const logError = (error: any, context: string, code: string) => {
  // Implement error logging to your monitoring service
  const errorLog = {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    code,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userId: null, // You can add user ID if available
  };
  
  console.error('Error logged:', errorLog);
  
  // Here you would send to your error monitoring service
  // Example: sendToSentry(errorLog) or sendToLogRocket(errorLog)
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await fn(...args);
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error, fn.name);
    }
  };
};

export const createAsyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
    showError?: boolean;
  } = {}
) => {
  const {
    successMessage,
    errorMessage,
    showSuccess = false,
    showError = true,
  } = options;
  
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await fn(...args);
      
      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }
      
      return { success: true, data: result };
    } catch (error) {
      const errorResponse = handleApiError(error, fn.name);
      
      if (showError && errorMessage) {
        toast.error(errorMessage);
      }
      
      return errorResponse;
    }
  };
};

// Utility function to check if response is successful
export const isSuccess = <T>(response: ApiResponse<T>): response is SuccessResponse<T> => {
  return response.success === true;
};

// Utility function to check if response is error
export const isError = <T>(response: ApiResponse<T>): response is ErrorResponse => {
  return response.success === false;
};

// Retry utility for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    !navigator.onLine
  );
};

// Rate limit error detection
export const isRateLimitError = (error: any): boolean => {
  return (
    error?.status === 429 ||
    error?.code === 'RATE_LIMIT_EXCEEDED' ||
    error?.message?.includes('rate limit')
  );
};