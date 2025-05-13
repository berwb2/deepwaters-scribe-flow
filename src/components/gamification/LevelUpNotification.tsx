
import React, { useState, useEffect } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpNotificationProps {
  show: boolean;
  onClose: () => void;
  level: number;
  rewards?: string[];
}

const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  show,
  onClose,
  level,
  rewards = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setIsOpen(show);
    if (show) {
      // Trigger confetti when level up dialog shows
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [show]);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-amber-100 p-4 rounded-full">
              <Trophy className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            Level Up!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <div className="text-lg font-bold mb-2">
              Congratulations! You've reached Level {level}
            </div>
            <p className="text-muted-foreground mb-4">
              Your dedication is paying off. Keep up the great work!
            </p>
            
            {rewards.length > 0 && (
              <div className="bg-muted p-3 rounded-lg mt-4">
                <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Rewards Unlocked
                </h3>
                <ul className="text-sm space-y-1">
                  {rewards.map((reward, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="bg-primary/10 text-primary rounded-full h-5 w-5 inline-flex items-center justify-center text-xs mr-2">
                        ✓
                      </span>
                      {reward}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full" onClick={handleClose}>
            Continue My Journey
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LevelUpNotification;
