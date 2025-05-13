
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import TaskItem, { Task } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        completed: false,
        due_date: dueDate ? dueDate.toISOString() : undefined
      });
      setNewTaskTitle('');
      setDueDate(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      handleAddTask();
    }
  };

  // Group tasks by completion status
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
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
        <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {dueDate && (
        <div className="text-sm text-water-deep flex items-center">
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

      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">To-Do ({pendingTasks.length})</h3>
          {pendingTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={(id, completed) => onUpdateTask(id, { completed })}
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
                onComplete={(id, completed) => onUpdateTask(id, { completed })}
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
