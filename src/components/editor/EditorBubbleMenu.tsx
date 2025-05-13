
import React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Code } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface EditorBubbleMenuProps {
  editor: Editor;
}

const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className="flex items-center rounded-md overflow-hidden border shadow-md bg-background">
        <Toggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          size="sm"
          aria-label="Bold"
          className="rounded-none"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
          aria-label="Italic"
          className="rounded-none"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          size="sm"
          aria-label="Underline"
          className="rounded-none"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          size="sm"
          aria-label="Inline Code"
          className="rounded-none"
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;
