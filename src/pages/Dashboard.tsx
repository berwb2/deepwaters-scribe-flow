import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import TaskList from '@/components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Calendar as CalendarIcon, File, Tag, Trophy } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Task } from '@/components/TaskItem';
import DocumentCard from '@/components/DocumentCard';
import { useQuery } from '@tanstack/react-query';
import { listDocuments, getCurrentUser } from '@/lib/api';
import LeaderboardDialog from '@/components/gamification/LeaderboardDialog';
import { DocumentMeta } from '@/types/documents';
import { SoundToggle } from '@/components/ui/sound-toggle';

// Task persistence with local storage
const getStoredTasks = (): Task[] => {
  try {
    const storedTasks = localStorage.getItem('deepwaters-tasks');
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
  } catch (error) {
    console.error('Error parsing stored tasks:', error);
  }
  return []; // Default to empty array if no tasks or error
};

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Save tasks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('deepwaters-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  // Fetch recent documents
  const { data: recentDocuments } = useQuery({
    queryKey: ['recentDocuments'],
    queryFn: () => listDocuments(
      {}, 
      { field: 'updated_at', direction: 'desc' },
      1,
      6
    ),
    enabled: !!user,
  });
  
  // Task Management Functions
  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`, // Generate a simple unique ID
    };
    setTasks([newTask, ...tasks]);
  };
  
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Get today's date as string for display
  const today = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.display_name || 'User'}</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <SoundToggle />
            <LeaderboardDialog />
            
            <Button asChild>
              <Link to="/create">
                <Plus className="mr-2 h-4 w-4" /> Create New Document
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content (Tasks & Calendar) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-serif">Today's Plan</CardTitle>
                  <div className="text-muted-foreground">{today}</div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tasks">
                  <TabsList className="mb-4">
                    <TabsTrigger value="tasks" className="flex items-center">
                      <List className="h-4 w-4 mr-2" /> Tasks
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks" className="space-y-4">
                    <TaskList 
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </TabsContent>
                  <TabsContent value="calendar">
                    <div className="flex flex-col items-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                      <p className="text-center text-muted-foreground text-sm mt-4">
                        Select a date to view or create scheduled items
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-serif">Recent Documents</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/documents">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentDocuments && recentDocuments.documents && recentDocuments.documents.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recentDocuments.documents.slice(0, 4).map((doc) => (
                      <DocumentCard key={doc.id} document={doc as DocumentMeta} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No documents yet</p>
                    <Button className="mt-4" asChild>
                      <Link to="/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Your First Document
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-serif">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/documents">
                    <File className="mr-2 h-4 w-4" /> All Documents
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/create">
                    <Plus className="mr-2 h-4 w-4" /> New Document
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/account">
                    <Tag className="mr-2 h-4 w-4" /> Manage Tags
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Trophy className="mr-2 h-4 w-4 text-amber-500" /> My Achievements
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-serif">Document Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium">Plans</div>
                      <div className="text-sm text-muted-foreground">3 documents</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-water" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium">Doctrines</div>
                      <div className="text-sm text-muted-foreground">2 documents</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium">Reflections</div>
                      <div className="text-sm text-muted-foreground">1 document</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
