import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import FileProcessor from '@/services/fileProcessor';
import { toast } from '@/components/ui/sonner';
import { FileText, Upload, X, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  documentId: string;
  onUploadSuccess?: (fileRecord: any) => void;
  className?: string;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    fileName: string;
  };
}

const FileUpload: React.FC<FileUploadProps> = ({ documentId, onUploadSuccess, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      
      // Initialize progress
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: {
          progress: 0,
          status: 'uploading',
          fileName: file.name
        }
      }));
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: Math.min(prev[fileId]?.progress + 10, 85)
            }
          }));
        }, 200);
        
        // Update to processing status
        setTimeout(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              status: 'processing',
              progress: 90
            }
          }));
        }, 1000);
        
        const result = await FileProcessor.uploadAndProcessFile(file, documentId);
        
        clearInterval(progressInterval);
        
        if (result.success) {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: 100,
              status: 'complete'
            }
          }));
          
          toast.success(`${file.name} uploaded successfully`);
          onUploadSuccess?.(result.fileRecord);
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              status: 'error'
            }
          }));
          
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        }
        
        // Clean up progress after 3 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 3000);
        
      } catch (error) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'error'
          }
        }));
        
        toast.error(`Error uploading ${file.name}`);
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
  }, [documentId, onUploadSuccess]);
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    disabled: uploading
  });
  
  const removeProgressItem = (fileId: string) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };
  
  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            <Upload className={`h-10 w-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          {isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-foreground font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, JPG, PNG, TXT, MD (max 50MB each)
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* File rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm font-medium text-destructive">{file.name}</p>
              <ul className="text-xs text-destructive/80 mt-1">
                {errors.map(error => (
                  <li key={error.code}>• {error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {/* Progress indicators */}
      {Object.entries(uploadProgress).length > 0 && (
        <div className="space-y-3">
          {Object.entries(uploadProgress).map(([fileId, progressData]) => (
            <div key={fileId} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">
                    {progressData.fileName}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {progressData.status === 'complete' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {progressData.status === 'error' && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <button
                    onClick={() => removeProgressItem(fileId)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={progressData.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {progressData.status === 'uploading' && 'Uploading...'}
                    {progressData.status === 'processing' && 'Processing...'}
                    {progressData.status === 'complete' && 'Complete'}
                    {progressData.status === 'error' && 'Error'}
                  </span>
                  <span>{progressData.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;