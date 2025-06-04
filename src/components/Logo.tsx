
import React from 'react';

type LogoProps = {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
};

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium', showText = true }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-14',
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} aspect-square rounded-full bg-gradient-to-br from-water-light to-water-deep flex items-center justify-center overflow-hidden`}>
          <div className="absolute w-full h-1/2 bottom-0 bg-water-deep opacity-50">
            <div className="w-[200%] h-full absolute left-0 animate-wave">
              <div className="w-1/2 h-full bg-white/30 rounded-t-full"></div>
            </div>
          </div>
        </div>
      </div>
      {showText && (
        <span className={`ml-2 font-serif font-medium ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'}`}>
          DeepWaters
        </span>
      )}
    </div>
  );
};

export default Logo;
