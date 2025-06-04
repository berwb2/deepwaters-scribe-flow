
import React from 'react';

type LogoProps = {
  className?: string;
  size?: 'small' | 'medium' | 'large';
};

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8', 
    large: 'h-10',
  };
  
  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} aspect-square rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden shadow-sm`}>
          <div className="absolute w-full h-1/2 bottom-0 bg-blue-700 opacity-60">
            <div className="w-[200%] h-full absolute left-0 animate-wave">
              <div className="w-1/2 h-full bg-white/30 rounded-t-full"></div>
            </div>
          </div>
        </div>
      </div>
      <span className={`font-serif font-semibold text-foreground ${textSizeClasses[size]}`}>
        DeepWaters
      </span>
    </div>
  );
};

export default Logo;
