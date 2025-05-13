
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
      <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
        {level}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Level {level}</span>
          <span>{currentXP}/{maxXP} XP</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <Trophy className="h-5 w-5 text-amber-400" />
    </div>
  );
};

export default XPBar;
