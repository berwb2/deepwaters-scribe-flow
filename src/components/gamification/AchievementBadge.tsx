
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Trophy,
  Star, 
  Badge as BadgeCheck
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'bronze' | 'silver' | 'gold' | 'special';
  earned: boolean;
  xpReward: number;
  icon?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md',
  showDetails = false 
}) => {
  const { title, type, earned, description } = achievement;
  
  const getBadgeColor = (type: string, earned: boolean) => {
    if (!earned) return 'bg-gray-200 text-gray-500 opacity-60';
    
    switch (type) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-slate-400 text-white';
      case 'gold': return 'bg-amber-400 text-white';
      case 'special': return 'bg-indigo-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'bronze': return <Trophy className="h-4 w-4" />;
      case 'silver': return <Award className="h-4 w-4" />;
      case 'gold': return <Star className="h-4 w-4" />;
      case 'special': return <BadgeCheck className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4'
  };
  
  return (
    <div className={`inline-block ${showDetails ? 'w-full' : ''}`}>
      <Badge 
        variant="outline"
        className={`${sizeClasses[size]} ${getBadgeColor(type, earned)} flex items-center gap-1.5 transition-all duration-200 ${earned ? 'hover:scale-105' : 'grayscale'}`}
      >
        {getIcon(type)}
        <span>{title}</span>
      </Badge>
      
      {showDetails && (
        <div className="mt-1 text-xs text-muted-foreground">
          {description}
          {earned && <span className="text-primary block mt-0.5">+{achievement.xpReward} XP</span>}
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
