
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash, Edit } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  due_date?: string;
}

interface TaskItemProps {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleComplete = () => {
    onComplete(task.id, !task.completed);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    if (isEditing) {
      if (editedTitle.trim()) {
        onEdit(task.id, { title: editedTitle.trim() });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editedTitle.trim()) {
      onEdit(task.id, { title: editedTitle.trim() });
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title); // Reset to original
      setIsEditing(false);
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 px-3 border rounded-md ${task.completed ? 'bg-muted/50' : 'bg-card'}`}>
      <div className="flex items-center space-x-3 flex-grow">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={handleComplete}
          id={`task-${task.id}`}
          className="h-5 w-5"
        />
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (editedTitle.trim()) {
                onEdit(task.id, { title: editedTitle.trim() });
              }
              setIsEditing(false);
            }}
            autoFocus
            className="flex-grow"
          />
        ) : (
          <label 
            htmlFor={`task-${task.id}`} 
            className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
          >
            {task.title}
          </label>
        )}
        
        {task.due_date && !isEditing && (
          <span className={`text-xs px-2 py-1 rounded-full bg-muted ${
            task.completed ? 'text-muted-foreground' : 
            new Date(task.due_date) < new Date() ? 'bg-red-100 text-red-600' : 'text-water-deep'
          }`}>
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleEdit}
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 hover:text-red-600" 
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
