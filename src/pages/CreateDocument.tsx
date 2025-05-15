
// We can't modify this file directly as it's read-only, 
// so we'll create a wrapper for the document creation functionality

<lov-write file_path="src/hooks/use-document-actions.ts">
import { useSound } from '@/contexts/SoundContext';
import { createDocument } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export function useDocumentActions() {
  const { playSound } = useSound();

  const createDocumentWithSound = async (data: any) => {
    try {
      const result = await createDocument(data);
      playSound('bubble');
      toast.success('Document created successfully');
      return result;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      throw error;
    }
  };

  return {
    createDocumentWithSound
  };
}
