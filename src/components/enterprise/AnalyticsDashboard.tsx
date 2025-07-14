import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Share, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalViews: number;
  totalEdits: number;
  totalDocuments: number;
  activeDocuments: number;
  topDocuments: Array<{
    title: string;
    views: number;
    edits: number;
    id: string;
  }>;
  activityByDay: Array<{
    date: string;
    views: number;
    edits: number;
  }>;
  actionBreakdown: Array<{
    action: string;
    count: number;
    color: string;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalEdits: 0,
    totalDocuments: 0,
    activeDocuments: 0,
    topDocuments: [],
    activityByDay: [],
    actionBreakdown: []
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    try {
      const cutoffDate = new Date();
      const days = parseInt(timeRange.replace('d', ''));
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('document_analytics')
        .select(`
          *,
          documents(title, id)
        `)
        .gte('created_at', cutoffDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Get total document count
      const { count: totalDocs } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);

      // Process analytics data
      const processedAnalytics = processAnalyticsData(analyticsData || [], totalDocs || 0);
      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (data: any[], totalDocs: number): AnalyticsData => {
    const viewActions = data.filter(item => item.action_type === 'view');
    const editActions = data.filter(item => item.action_type === 'edit');
    
    // Document activity aggregation
    const docActivity = data.reduce((acc, item) => {
      const docId = item.document_id;
      const docTitle = item.documents?.title || 'Unknown';
      
      if (!acc[docId]) {
        acc[docId] = { title: docTitle, views: 0, edits: 0, id: docId };
      }
      
      if (item.action_type === 'view') acc[docId].views++;
      if (item.action_type === 'edit') acc[docId].edits++;
      
      return acc;
    }, {} as Record<string, { title: string; views: number; edits: number; id: string }>);

    const topDocuments = Object.values(docActivity) as Array<{
      title: string;
      views: number;
      edits: number;
      id: string;
    }>;
    
    const sortedTopDocuments = topDocuments
      .sort((a, b) => (b.views + b.edits) - (a.views + a.edits))
      .slice(0, 10);

    // Activity by day
    const activityByDay = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = { date, views: 0, edits: 0 };
      }
      
      if (item.action_type === 'view') acc[date].views++;
      if (item.action_type === 'edit') acc[date].edits++;
      
      return acc;
    }, {} as Record<string, { date: string; views: number; edits: number }>);

    const sortedActivityByDay = Object.values(activityByDay) as Array<{
      date: string;
      views: number;
      edits: number;
    }>;
    
    const finalActivityByDay = sortedActivityByDay.sort((a, b) => a.date.localeCompare(b.date));

    // Action breakdown
    const actionCounts = data.reduce((acc, item) => {
      acc[item.action_type] = (acc[item.action_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const actionBreakdown = Object.entries(actionCounts).map(([action, count]) => ({
      action,
      count: count as number,
      color: getActionColor(action)
    }));

    return {
      totalViews: viewActions.length,
      totalEdits: editActions.length,
      totalDocuments: totalDocs,
      activeDocuments: Object.keys(docActivity).length,
      topDocuments: sortedTopDocuments,
      activityByDay: finalActivityByDay,
      actionBreakdown
    };
  };

  const getActionColor = (action: string) => {
    const colors = {
      view: '#3B82F6',
      edit: '#10B981',
      share: '#F59E0B',
      export: '#EF4444',
      ai_query: '#8B5CF6'
    };
    return colors[action as keyof typeof colors] || '#6B7280';
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Views', analytics.totalViews],
      ['Total Edits', analytics.totalEdits],
      ['Total Documents', analytics.totalDocuments],
      ['Active Documents', analytics.activeDocuments],
      [''],
      ['Top Documents', ''],
      ['Document', 'Views', 'Edits'],
      ...analytics.topDocuments.map(doc => [doc.title, doc.views, doc.edits])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Document reads
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Edits</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEdits}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Content changes
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeDocuments}</div>
            <Badge variant="secondary" className="mt-1">
              of {analytics.totalDocuments} total
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalDocuments > 0 
                ? Math.round((analytics.activeDocuments / analytics.totalDocuments) * 100) 
                : 0}%
            </div>
            <Badge variant="secondary" className="mt-1">
              Document usage
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.activityByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="edits" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.actionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ action, percent }) => `${action} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.actionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topDocuments.map((doc, index) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.views} views • {doc.edits} edits
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{doc.views}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{doc.edits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;