
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Medal, Crown, Star } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatar?: string;
  streak: number;
  completedTasks: number;
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardUser[] = [
  { id: '1', name: 'Jane Cooper', xp: 1280, level: 12, streak: 7, completedTasks: 45 },
  { id: '2', name: 'Robert Fox', xp: 1050, level: 10, streak: 3, completedTasks: 38 },
  { id: '3', name: 'Current User', xp: 950, level: 9, streak: 5, completedTasks: 30 },
  { id: '4', name: 'Jacob Jones', xp: 880, level: 8, streak: 2, completedTasks: 27 },
  { id: '5', name: 'Wade Warren', xp: 750, level: 7, streak: 0, completedTasks: 20 },
];

const LeaderboardDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Return appropriate medal icon based on position
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return <Crown className="h-5 w-5 text-amber-400" />;
      case 1: return <Medal className="h-5 w-5 text-slate-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <Star className="h-5 w-5 text-water-deep" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 group border-water-light hover:border-water-deep hover:bg-blue-50"
          onClick={() => setIsOpen(true)}
        >
          <Trophy className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="absolute -z-10 inset-0 overflow-hidden rounded-lg">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-water-light/30 rounded-full"></div>
          <div className="absolute -bottom-20 -left-40 w-60 h-60 bg-blue-100/40 rounded-full"></div>
        </div>
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl colored-heading">
            <Trophy className="h-6 w-6 text-amber-500" />
            Leaderboard
          </DialogTitle>
          <div className="color-line w-24"></div>
          <DialogDescription className="text-center pt-2">
            See how you rank compared to other users
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between text-sm font-medium pb-2 border-b">
            <span>User</span>
            <div className="flex gap-8">
              <span>Level</span>
              <span>XP</span>
            </div>
          </div>
          
          {mockLeaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between py-3 px-2 rounded-lg transition-all duration-200 ${
                user.name === 'Current User' 
                  ? 'bg-water-light/20 border border-water-light/50 shadow-sm' 
                  : 'hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-3
                  ${index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : 
                    index === 2 ? 'bg-gradient-to-br from-amber-700/80 to-amber-800 text-amber-100' : 'bg-muted text-muted-foreground'}`
                }>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {user.name}
                    {index < 3 && getMedalIcon(index)}
                    {user.name === 'Current User' && <span className="text-xs text-water-deep ml-2 px-1.5 py-0.5 bg-blue-100 rounded-full">(You)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      {user.completedTasks} tasks
                    </span>
                    {user.streak > 0 && (
                      <span className="flex items-center">
                        <span className="text-amber-500 mr-1">🔥</span>
                        {user.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-water to-water-deep text-white flex items-center justify-center text-sm font-bold">
                    {user.level}
                  </div>
                </div>
                <div className="text-right w-16">
                  <span className="font-semibold text-water-deep">{user.xp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            className="w-full bg-gradient-to-r from-water-deep to-water hover:from-water hover:to-water-deep text-white"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog;
