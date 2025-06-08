
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Button } from "@/components/ui/button";
import TaskList from '@/components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Calendar as CalendarIcon, File, Tag, Trophy, Brain } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Task } from '@/components/TaskItem';
import DocumentCard from '@/components/DocumentCard';
import { useQuery } from '@tanstack/react-query';
import { listDocuments, getCurrentUser } from '@/lib/api';
import LeaderboardDialog from '@/components/gamification/LeaderboardDialog';
import { DocumentMeta } from '@/types/documents';
import { SoundToggle } from '@/components/ui/sound-toggle';

const getStoredTasks = (): Task[] => {
  try {
    const storedTasks = localStorage.getItem('deepwaters-tasks');
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
  } catch (error) {
    console.error('Error parsing stored tasks:', error);
  }
  return [];
};

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    localStorage.setItem('deepwaters-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  const { data: recentDocuments } = useQuery({
    queryKey: ['recentDocuments'],
    queryFn: () => listDocuments(),
    enabled: !!user,
  });
  
  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
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
  
  const today = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-medium mb-2 text-blue-600">Dashboard</h1>
              <p className="text-blue-700">Welcome back, {user?.user_metadata?.display_name || 'User'}</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <SoundToggle />
              <LeaderboardDialog />
              
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" /> Create New Document
                </Link>
              </Button>

              <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Link to="/grand-strategist">
                  <Brain className="mr-2 h-4 w-4" /> AI Strategist
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content (Tasks & Calendar) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-blue-200 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-serif text-blue-700">Today's Plan</CardTitle>
                    <div className="text-blue-600">{today}</div>
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
                        <div className="text-center mt-4">
                          <p className="text-blue-600 text-sm mb-4">
                            Select a date to view or create scheduled items
                          </p>
                          <Button asChild className="bg-blue-500 hover:bg-blue-600">
                            <Link to="/calendar">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Full Calendar View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-serif text-blue-700">Recent Documents</CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:bg-blue-50">
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
                      <File className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-600">No documents yet</p>
                      <Button className="mt-4 bg-blue-500 hover:bg-blue-600" asChild>
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
              <Card className="border-blue-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-serif text-blue-700">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                    <Link to="/documents">
                      <File className="mr-2 h-4 w-4" /> All Documents
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                    <Link to="/create">
                      <Plus className="mr-2 h-4 w-4" /> New Document
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                    <Link to="/calendar">
                      <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                    <Link to="/account">
                      <Tag className="mr-2 h-4 w-4" /> Manage Tags
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Trophy className="mr-2 h-4 w-4 text-amber-500" /> My Achievements
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-serif text-blue-700">Document Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium text-blue-700">Plans</div>
                        <div className="text-sm text-blue-600">3 documents</div>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium text-blue-700">Doctrines</div>
                        <div className="text-sm text-blue-600">2 documents</div>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium text-blue-700">Reflections</div>
                        <div className="text-sm text-blue-600">1 document</div>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-700" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
