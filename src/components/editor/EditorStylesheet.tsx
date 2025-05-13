
import React from 'react';

const EditorStylesheet: React.FC = () => {
  return (
    <style>
      {`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .code-block {
          background-color: #282c34;
          color: #abb2bf;
          font-family: monospace;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
      `}
    </style>
  );
};

export default EditorStylesheet;
