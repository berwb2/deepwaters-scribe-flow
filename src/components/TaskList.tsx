
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import TaskItem, { Task } from './TaskItem';
import { TaskAchievement } from './gamification';
import { toast } from '@/components/ui/use-toast';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [streakCount, setStreakCount] = useState(() => {
    const stored = localStorage.getItem('taskStreak');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lastCompletionDate, setLastCompletionDate] = useState(() => {
    const stored = localStorage.getItem('lastCompletionDate');
    return stored || '';
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      try {
        onAddTask({
          title: newTaskTitle.trim(),
          completed: false,
          due_date: dueDate ? dueDate.toISOString() : undefined
        });
        setNewTaskTitle('');
        setDueDate(undefined);
        toast({
          title: "Task added",
          description: "Your task has been created successfully."
        });
      } catch (error) {
        console.error("Error adding task:", error);
        toast({
          title: "Error adding task",
          description: "There was an error creating your task. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      handleAddTask();
    }
  };

  const handleTaskCompletion = (id: string, completed: boolean) => {
    try {
      onUpdateTask(id, { completed });
      
      if (completed) {
        // Trigger gamification reward
        setTaskCompleted(true);
        setTimeout(() => setTaskCompleted(false), 100);
        
        // Update streak
        const today = new Date().toISOString().split('T')[0];
        
        // If this is the first completion or a continuation of the streak
        if (!lastCompletionDate || isYesterday(lastCompletionDate, today)) {
          const newStreak = streakCount + 1;
          setStreakCount(newStreak);
          localStorage.setItem('taskStreak', newStreak.toString());
        } else if (lastCompletionDate !== today) {
          // If not yesterday and not today, reset streak
          setStreakCount(1);
          localStorage.setItem('taskStreak', '1');
        }
        
        // Update last completion date
        setLastCompletionDate(today);
        localStorage.setItem('lastCompletionDate', today);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: "There was an error updating your task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper to check if a date is yesterday
  const isYesterday = (previousDate: string, today: string) => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    return previousDate === yesterdayString;
  };
  
  // Check if streak should be reset (missed a day)
  useEffect(() => {
    if (streakCount > 0 && lastCompletionDate) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = new Date(lastCompletionDate);
      lastDate.setDate(lastDate.getDate() + 1); // Add one day to last completion
      const nextExpectedDay = lastDate.toISOString().split('T')[0];
      
      // If today is past the next expected day, reset streak
      if (today > nextExpectedDay) {
        setStreakCount(0);
        localStorage.setItem('taskStreak', '0');
      }
    }
  }, [streakCount, lastCompletionDate]);

  // Group tasks by completion status
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <Input
          placeholder="Add new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow min-w-0"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {dueDate && (
        <div className="text-sm text-water-deep flex items-center flex-wrap">
          <Calendar className="h-4 w-4 mr-1" />
          Due date: {format(dueDate, "MMM d, yyyy")}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 py-0 ml-2"
            onClick={() => setDueDate(undefined)}
          >
            Clear
          </Button>
        </div>
      )}
      
      {/* Gamification component */}
      <TaskAchievement 
        taskCompleted={taskCompleted}
        streakCount={streakCount}
        className="bg-muted/50 p-3 rounded-lg"
      />

      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">To-Do ({pendingTasks.length})</h3>
          {pendingTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleTaskCompletion}
              onDelete={onDeleteTask}
              onEdit={onUpdateTask}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-muted-foreground">Completed ({completedTasks.length})</h3>
          <div className="space-y-2 opacity-80">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleTaskCompletion}
                onDelete={onDeleteTask}
                onEdit={onUpdateTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
