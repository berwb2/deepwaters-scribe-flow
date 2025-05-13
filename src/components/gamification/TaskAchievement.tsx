
import React, { useEffect, useState } from 'react';
import XPBar from '@/components/gamification/XPBar';
import LevelUpNotification from '@/components/gamification/LevelUpNotification';
import { calculateXPProgress, LEVEL_REWARDS, XP_REWARDS } from '@/lib/gamification';
import { Award, TrendingUp, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TaskAchievementProps {
  taskCompleted?: boolean;
  streakCount?: number;
  className?: string;
}

const TaskAchievement: React.FC<TaskAchievementProps> = ({ 
  taskCompleted = false,
  streakCount = 0,
  className = ''
}) => {
  // In a real app, this would come from user state/database
  const [totalXP, setTotalXP] = useState(() => {
    const storedXP = localStorage.getItem('userXP');
    return storedXP ? parseInt(storedXP, 10) : 0;
  });
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [rewards, setRewards] = useState<string[]>([]);
  const [xpAnimation, setXpAnimation] = useState(false);
  
  // Calculate level and XP progress
  const { level, currentXP, requiredXP } = calculateXPProgress(totalXP);
  
  // Process task completion
  useEffect(() => {
    if (taskCompleted) {
      const newXP = totalXP + XP_REWARDS.TASK_COMPLETION;
      
      // Check if we leveled up
      const currentLevel = calculateXPProgress(totalXP).level;
      const newLevelInfo = calculateXPProgress(newXP);
      
      if (newLevelInfo.level > currentLevel) {
        setNewLevel(newLevelInfo.level);
        
        // Check if this level has rewards
        if (LEVEL_REWARDS[newLevelInfo.level as keyof typeof LEVEL_REWARDS]) {
          setRewards(LEVEL_REWARDS[newLevelInfo.level as keyof typeof LEVEL_REWARDS]);
        } else {
          setRewards([`+${XP_REWARDS.TASK_COMPLETION} XP Bonus`]);
        }
        
        setShowLevelUp(true);
      }
      
      // Show animation
      setXpAnimation(true);
      setTimeout(() => setXpAnimation(false), 1500);
      
      // Save the XP
      setTotalXP(newXP);
      localStorage.setItem('userXP', newXP.toString());
    }
  }, [taskCompleted, totalXP]);
  
  const getStreakEmoji = (count: number) => {
    if (count >= 30) return '🔥🔥🔥';
    if (count >= 14) return '🔥🔥';
    if (count >= 7) return '🔥';
    if (count > 0) return '✨';
    return '';
  };
  
  return (
    <>
      <div className={`flex flex-col space-y-3 border border-water-light/50 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <div className="bg-gradient-to-r from-water-deep to-water text-white rounded-full p-1 mr-2">
              <Award className="text-white h-4 w-4" />
            </div>
            <span className="colored-heading text-base">Your Progress</span>
            
            {xpAnimation && (
              <div className="text-xs bg-water-deep text-white px-2 py-0.5 rounded-full ml-2 animate-bounce shadow-sm">
                +{XP_REWARDS.TASK_COMPLETION} XP!
              </div>
            )}
          </div>
          
          <div className="flex items-center text-xs">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              streakCount > 0 ? 'bg-amber-100 text-amber-800' : 'text-muted-foreground'
            }`}>
              <Flame className={`h-3 w-3 ${streakCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
              <span>Streak: {streakCount} {getStreakEmoji(streakCount)}</span>
            </div>
          </div>
        </div>
        
        <XPBar 
          currentXP={currentXP}
          maxXP={requiredXP}
          level={level}
        />
        
        {streakCount > 0 && (
          <div className="mt-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Weekly Streak</span>
              <span>{streakCount % 7}/7 days</span>
            </div>
            <Progress 
              value={(streakCount % 7) * 100 / 7} 
              className="h-1.5 bg-gray-100" 
              indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-500"
            />
          </div>
        )}
      </div>
      
      <LevelUpNotification 
        show={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        level={newLevel}
        rewards={rewards}
      />
    </>
  );
};

export default TaskAchievement;
