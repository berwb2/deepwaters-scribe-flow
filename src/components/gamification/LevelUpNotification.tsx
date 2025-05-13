
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
import { Trophy, Award, Sparkles } from 'lucide-react';
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
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#33C3F0', '#0EA5E9', '#D3E4FD', '#FFC107']
      });
      
      // Add a second burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
          colors: ['#33C3F0', '#0EA5E9', '#D3E4FD', '#FFC107']
        });
      }, 300);
      
      // And a third from the other side
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
          colors: ['#33C3F0', '#0EA5E9', '#D3E4FD', '#FFC107']
        });
      }, 500);
    }
  }, [show]);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-water opacity-10 rounded-full"></div>
        
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-5 rounded-full shadow-lg">
              <Trophy className="h-14 w-14 text-amber-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-3xl colored-heading">
            Level Up!
          </AlertDialogTitle>
          <div className="color-line w-24 mx-auto"></div>
          <AlertDialogDescription className="text-center">
            <div className="text-lg font-bold mb-2 flex items-center justify-center gap-2 mt-3">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Congratulations! You've reached Level {level}</span>
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-muted-foreground mb-4">
              Your dedication is paying off. Keep up the great work!
            </p>
            
            {rewards.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-water-light/30 p-4 rounded-lg mt-4 border border-water-light/50 shadow-inner">
                <h3 className="text-sm font-medium flex items-center gap-1 mb-3 text-water-deep">
                  <Award className="h-4 w-4 text-amber-500" />
                  Rewards Unlocked
                </h3>
                <ul className="text-sm space-y-2">
                  {rewards.map((reward, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="bg-gradient-to-r from-water to-water-deep text-white rounded-full h-5 w-5 inline-flex items-center justify-center text-xs mr-2 shadow-sm">
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
          <AlertDialogAction 
            className="w-full bg-gradient-to-r from-water-deep to-water hover:from-water hover:to-water-deep text-white font-medium transition-all duration-300" 
            onClick={handleClose}
          >
            Continue My Journey
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LevelUpNotification;
