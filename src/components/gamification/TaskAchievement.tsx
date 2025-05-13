
import React, { useEffect, useState } from 'react';
import { XPBar } from '@/components/gamification/XPBar';
import { LevelUpNotification } from '@/components/gamification/LevelUpNotification';
import { calculateXPProgress, LEVEL_REWARDS, XP_REWARDS } from '@/lib/gamification';
import { Award, TrendingUp } from 'lucide-react';
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
  
  return (
    <>
      <div className={`flex flex-col space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Award className="text-amber-500 h-4 w-4 mr-1" />
            <span>Your Progress</span>
            
            {xpAnimation && (
              <span className="text-xs text-primary ml-2 animate-bounce">
                +{XP_REWARDS.TASK_COMPLETION} XP!
              </span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Streak: {streakCount} {streakCount > 0 ? '🔥' : ''}</span>
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
              <span className="font-medium">Streak Progress</span>
              <span>{streakCount % 7}/7 days</span>
            </div>
            <Progress value={(streakCount % 7) * 100 / 7} className="h-1.5" />
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
