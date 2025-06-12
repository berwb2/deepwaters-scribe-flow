
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import CreateDocumentInFolderDialog from './CreateDocumentInFolderDialog';

interface CreateDocumentInFolderButtonProps {
  folderId: string;
  onDocumentCreated?: () => void;
  className?: string;
}

const CreateDocumentInFolderButton: React.FC<CreateDocumentInFolderButtonProps> = ({
  folderId,
  onDocumentCreated,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentCreated = () => {
    setIsOpen(false);
    onDocumentCreated?.();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Document
      </Button>
      
      <CreateDocumentInFolderDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        folderId={folderId}
        onDocumentCreated={handleDocumentCreated}
      />
    </>
  );
};

export default CreateDocumentInFolderButton;
