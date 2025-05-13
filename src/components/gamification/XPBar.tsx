
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, maxXP, level }) => {
  const progressPercentage = (currentXP / maxXP) * 100;
  
  return (
    <div className="flex items-center space-x-2 w-full">
      <div className="bg-gradient-to-br from-water-deep to-blue-400 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shadow-md">
        {level}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Level {level}</span>
          <span className="text-water-deep font-semibold">{currentXP}/{maxXP} XP</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2.5 bg-gray-100" 
          indicatorClassName="bg-gradient-to-r from-water-deep to-water" 
        />
      </div>
      <Trophy className="h-5 w-5 text-amber-400 animate-pulse-soft" />
    </div>
  );
};

export default XPBar;
