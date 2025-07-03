
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/6f9ad5aa-559c-4f73-9a91-bf2820b07924.png" 
        alt="DeepWaters Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <span className={`font-bold text-blue-800 ${textSizeClasses[size]} whitespace-nowrap`}>
          DeepWaters
        </span>
      )}
    </div>
  );
};

export default Logo;
