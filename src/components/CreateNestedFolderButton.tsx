
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus } from 'lucide-react';
import CreateNestedFolderDialog from './CreateNestedFolderDialog';

interface CreateNestedFolderButtonProps {
  parentFolderId: string;
  onFolderCreated?: () => void;
  className?: string;
}

const CreateNestedFolderButton: React.FC<CreateNestedFolderButtonProps> = ({
  parentFolderId,
  onFolderCreated,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFolderCreated = () => {
    setIsOpen(false);
    onFolderCreated?.();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`bg-teal-600 hover:bg-teal-700 text-white ${className}`}
        size="sm"
        variant="outline"
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        New Folder
      </Button>
      
      <CreateNestedFolderDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        parentFolderId={parentFolderId}
        onFolderCreated={handleFolderCreated}
      />
    </>
  );
};

export default CreateNestedFolderButton;
