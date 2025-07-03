
import React from 'react';

interface AIResponseFormatterProps {
  content: string;
  className?: string;
}

const AIResponseFormatter = ({ content, className = '' }: AIResponseFormatterProps) => {
  return (
    <div className={`prose max-w-none ${className}`}>
      <p className="text-gray-600">AI responses are temporarily unavailable.</p>
    </div>
  );
};

export default AIResponseFormatter;
