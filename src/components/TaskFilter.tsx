
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TaskFilterType = 'all' | 'completed' | 'pending' | 'today' | 'tomorrow' | 'week';

interface TaskFilterProps {
  currentFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ currentFilter, onFilterChange }) => {
  const getFilterLabel = (filter: TaskFilterType) => {
    switch (filter) {
      case 'all': return 'All Tasks';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      case 'week': return 'This Week';
      default: return 'All Tasks';
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          {getFilterLabel(currentFilter)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => onFilterChange('all')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'all' ? 'font-medium' : ''}>All Tasks</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('completed')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'completed' ? 'font-medium' : ''}>Completed</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('pending')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'pending' ? 'font-medium' : ''}>Pending</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Time Period</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => onFilterChange('today')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'today' ? 'font-medium' : ''}>Today</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('tomorrow')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'tomorrow' ? 'font-medium' : ''}>Tomorrow</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('week')}
            className="cursor-pointer"
          >
            <span className={currentFilter === 'week' ? 'font-medium' : ''}>This Week</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskFilter;
