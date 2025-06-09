
import React from 'react';

interface AIResponseFormatterProps {
  content: string;
  className?: string;
}

const AIResponseFormatter = ({ content, className = '' }: AIResponseFormatterProps) => {
  // Format AI response with proper styling
  const formatContent = (text: string) => {
    // Handle bold text with **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-800">$1</strong>');
    
    // Handle numbered lists
    formatted = formatted.replace(/^\d+\.\s(.*)$/gm, '<div class="mb-2"><span class="font-medium text-blue-700">$&</span></div>');
    
    // Handle bullet points
    formatted = formatted.replace(/^-\s(.*)$/gm, '<div class="mb-1 pl-4"><span class="text-blue-600">•</span> <span class="text-blue-700">$1</span></div>');
    
    // Handle key themes or sections
    formatted = formatted.replace(/^(Key themes?|Themes?|Analysis|Summary|Recommendations?):$/gm, '<h3 class="font-semibold text-blue-800 mt-4 mb-2 text-lg">$1</h3>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3 text-blue-700 leading-relaxed">');
    
    // Wrap in paragraph tags
    if (!formatted.startsWith('<')) {
      formatted = `<p class="mb-3 text-blue-700 leading-relaxed">${formatted}</p>`;
    }
    
    return formatted;
  };

  return (
    <div 
      className={`prose prose-blue max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

export default AIResponseFormatter;
