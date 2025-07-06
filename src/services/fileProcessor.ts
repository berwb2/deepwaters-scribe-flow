import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STORAGE_BUCKET = 'document-files';

export interface FileProcessingResult {
  success: boolean;
  fileRecord?: any;
  extractedText?: string;
  error?: string;
}

class FileProcessor {
  async uploadAndProcessFile(file: File, documentId: string): Promise<FileProcessingResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Extract text based on file type
      let extractedText = '';
      const fileType = file.type;
      
      if (fileType === 'application/pdf') {
        extractedText = await this.extractPDFText(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await this.extractDOCXText(file);
      } else if (fileType.startsWith('image/')) {
        extractedText = await this.extractImageText(file);
      } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
        extractedText = await this.extractPlainText(file);
      }
      
      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('file_attachments')
        .insert({
          document_id: documentId,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: fileType,
          file_size: file.size,
          extracted_text: extractedText,
          processed: true
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      return {
        success: true,
        fileRecord,
        extractedText
      };
      
    } catch (error) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private async extractPDFText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }
      
      return text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  }
  
  private async extractDOCXText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return '';
    }
  }
  
  private async extractImageText(file: File): Promise<string> {
    // For images, we'll use a placeholder since OCR requires server-side processing
    // You can integrate with services like Google Vision API or Azure Computer Vision
    console.log('Image OCR not implemented yet - requires server-side processing');
    return `[Image: ${file.name}]`;
  }
  
  private async extractPlainText(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text;
    } catch (error) {
      console.error('Plain text extraction error:', error);
      return '';
    }
  }
  
  async getFileUrl(filePath: string): Promise<string | null> {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    return data?.signedUrl || null;
  }
  
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      
      return !error;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }
}

export default new FileProcessor();