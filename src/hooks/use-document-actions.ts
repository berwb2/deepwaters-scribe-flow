
import { useSound } from '@/contexts/SoundContext';
import { createDocument } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export function useDocumentActions() {
  const { playSound } = useSound();

  const createDocumentWithSound = async (title: string, content: string, contentType: string, isTemplate: boolean = false, metadata: any = {}) => {
    try {
      const result = await createDocument(title, content, contentType, isTemplate, metadata);
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
