
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
import { Trophy, Award, Medal } from 'lucide-react';

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
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 group"
          onClick={() => setIsOpen(true)}
        >
          <Trophy className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements Leaderboard
          </DialogTitle>
          <DialogDescription>
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
              className={`flex items-center justify-between py-2 ${
                user.name === 'Current User' ? 'bg-primary/5 -mx-2 px-2 rounded-md' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3
                  ${index === 0 ? 'bg-amber-100 text-amber-800' : 
                    index === 1 ? 'bg-slate-100 text-slate-800' : 
                    index === 2 ? 'bg-amber-700/60 text-amber-100' : 'bg-muted text-muted-foreground'}`
                }>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">
                    {user.name}
                    {user.name === 'Current User' && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
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
                  <span className="font-semibold">{user.level}</span>
                </div>
                <div className="text-right w-16">
                  <span>{user.xp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog;
