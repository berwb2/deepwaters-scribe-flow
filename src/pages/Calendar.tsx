
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from '@/components/ui/sonner';
import { List, CalendarIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TaskList from '@/components/TaskList';
import { Task } from '@/components/TaskItem';
import { useDocumentActions } from '@/hooks/use-document-actions';

interface DateTask extends Task {
  date: string; // ISO string date format
  priority: 'low' | 'medium' | 'high';
}

interface DateNote {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string date format
}

// Helper function to group tasks by date
const groupByDate = (items: DateTask[] | DateNote[]) => {
  return items.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, any[]>);
};

// Task persistence with local storage
const getStoredDateTasks = (): DateTask[] => {
  try {
    const storedTasks = localStorage.getItem('deepwaters-date-tasks');
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
  } catch (error) {
    console.error('Error parsing stored date tasks:', error);
  }
  return []; // Default to empty array if no tasks or error
};

// Notes persistence with local storage
const getStoredDateNotes = (): DateNote[] => {
  try {
    const storedNotes = localStorage.getItem('deepwaters-date-notes');
    if (storedNotes) {
      return JSON.parse(storedNotes);
    }
  } catch (error) {
    console.error('Error parsing stored date notes:', error);
  }
  return []; // Default to empty array if no notes or error
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isOpen, setIsOpen] = useState(false);
  const [itemType, setItemType] = useState<'task' | 'note'>('task');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dateTasks, setDateTasks] = useState<DateTask[]>(getStoredDateTasks);
  const [dateNotes, setDateNotes] = useState<DateNote[]>(getStoredDateNotes);
  
  const { createDocumentWithSound } = useDocumentActions();

  // Save tasks to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('deepwaters-date-tasks', JSON.stringify(dateTasks));
  }, [dateTasks]);

  // Save notes to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('deepwaters-date-notes', JSON.stringify(dateNotes));
  }, [dateNotes]);

  // Group tasks and notes by date for calendar display
  const tasksByDate = groupByDate(dateTasks);
  const notesByDate = groupByDate(dateNotes);

  // Calculate items for selected date
  const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
  const tasksForSelectedDate = selectedDateStr ? tasksByDate[selectedDateStr] || [] : [];
  const notesForSelectedDate = selectedDateStr ? notesByDate[selectedDateStr] || [] : [];

  const handleAddTask = (task: Omit<DateTask, 'id' | 'date'>) => {
    if (!date) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const newTask: DateTask = {
      ...task,
      id: `task-${Date.now()}`, // Generate a simple unique ID
      date: dateStr,
    };
    setDateTasks([newTask, ...dateTasks]);
    toast.success('Task added to calendar');
    setIsOpen(false);
    resetForm();
  };

  const handleAddNote = async () => {
    if (!date || !title || !content) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Create a document in the backend
      const resultId = await createDocumentWithSound({
        title,
        content,
        content_type: 'note',
        metadata: { calendarDate: dateStr }
      });
      
      // Also add to our local state for calendar display
      const newNote = {
        id: resultId || `note-${Date.now()}`,
        title,
        content, 
        date: dateStr,
      };
      
      setDateNotes([newNote, ...dateNotes]);
      toast.success('Note added to calendar');
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleUpdateTask = (id: string, updates: Partial<DateTask>) => {
    setDateTasks(dateTasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setDateTasks(dateTasks.filter(task => task.id !== id));
    toast.success('Task removed from calendar');
  };

  const handleDeleteNote = (id: string) => {
    setDateNotes(dateNotes.filter(note => note.id !== id));
    toast.success('Note removed from calendar');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('medium');
  };

  const openNoteDetail = (noteId: string) => {
    navigate(`/documents/${noteId}`);
  };

  // Create a date cellrender function to show indicators
  const renderDayContent = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    const tasks = tasksByDate[dayStr] || [];
    const notes = notesByDate[dayStr] || [];
    const totalItems = tasks.length + notes.length;
    
    if (totalItems === 0) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className={`h-1.5 w-1.5 rounded-full ${totalItems > 0 ? 'bg-water-deep' : 'bg-transparent'}`} />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2">Calendar</h1>
            <p className="text-muted-foreground">Plan and schedule your tasks and notes</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')}>
              <TabsList>
                <TabsTrigger value="calendar" className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Add to Calendar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={itemType} onValueChange={(v) => setItemType(v as 'task' | 'note')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title"
                    />
                  </div>

                  {itemType === 'task' && (
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {itemType === 'note' && (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter content"
                        rows={5}
                      />
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (itemType === 'task') {
                          handleAddTask({ title, priority, completed: false });
                        } else {
                          handleAddNote();
                        }
                      }}
                      disabled={!title}
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs value={view} className="space-y-4">
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Monthly View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="pointer-events-auto"
                    components={{
                      DayContent: ({ date }) => (
                        <>
                          {date.getDate()}
                          {renderDayContent(date)}
                        </>
                      )
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {date && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    {format(date, 'MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksForSelectedDate.length === 0 && notesForSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No items for this date</p>
                      <Button onClick={() => setIsOpen(true)} className="mt-4">
                        Add Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tasksForSelectedDate.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3">Tasks</h3>
                          <ul className="space-y-2">
                            {tasksForSelectedDate.map((task) => (
                              <li key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleUpdateTask(task.id, { completed: !task.completed })}
                                    className="mr-3 h-4 w-4"
                                  />
                                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                    {task.title}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Remove
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {notesForSelectedDate.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3">Notes</h3>
                          <ul className="space-y-2">
                            {notesForSelectedDate.map((note) => (
                              <li key={note.id} className="p-3 border rounded-md">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium">{note.title}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                  {note.content}
                                </p>
                                <Button 
                                  variant="link" 
                                  className="px-0 h-auto" 
                                  onClick={() => openNoteDetail(note.id)}
                                >
                                  View Details
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {dateTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No calendar tasks yet</p>
                    <Button onClick={() => setIsOpen(true)} className="mt-4">
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {dateTasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleUpdateTask(task.id, { completed: !task.completed })}
                            className="mr-3 h-4 w-4"
                          />
                          <div>
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(task.date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>All Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {dateNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No calendar notes yet</p>
                    <Button onClick={() => { setItemType('note'); setIsOpen(true); }} className="mt-4">
                      Add Note
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {dateNotes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{note.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(note.date), 'MMM d, yyyy')}
                        </div>
                        <p className="text-sm line-clamp-3">{note.content}</p>
                        <Button 
                          variant="link" 
                          className="px-0 h-auto mt-2" 
                          onClick={() => openNoteDetail(note.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CalendarPage;
