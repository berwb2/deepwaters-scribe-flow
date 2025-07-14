import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Edit, Trash2, FileText, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  user_id: string;
}

interface TemplateData {
  title: string;
  content: string;
  content_type: string;
  document_type: string;
  metadata: any;
}

const TemplateSystem: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'general',
    is_public: false,
    template_data: {
      title: '',
      content: '',
      content_type: 'text/markdown',
      document_type: 'document',
      metadata: {}
    }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error Loading Templates",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const createTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('document_templates')
        .insert({
          user_id: user.id,
          name: newTemplate.name,
          description: newTemplate.description,
          category: newTemplate.category,
          is_public: newTemplate.is_public,
          template_data: newTemplate.template_data
        });

      if (error) throw error;

      toast({
        title: "Template Created",
        description: "Your template has been created successfully"
      });

      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'general',
        is_public: false,
        template_data: {
          title: '',
          content: '',
          content_type: 'text/markdown',
          document_type: 'document',
          metadata: {}
        }
      });
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error Creating Template",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  };

  const useTemplate = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const templateData = template.template_data as TemplateData;

      // Create document from template
      const { data: docData, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: templateData.title || `New ${template.name}`,
          content: templateData.content || '',
          content_type: templateData.content_type || 'text/markdown',
          document_type: templateData.document_type || 'document',
          metadata: { ...templateData.metadata, template_id: template.id }
        })
        .select()
        .single();

      if (error) throw error;

      // Update template usage count
      await supabase
        .from('document_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      toast({
        title: "Document Created",
        description: "Document created from template successfully"
      });

      // Navigate to the new document
      navigate(`/documents/${docData.id}`);
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error Using Template",
        description: "Failed to create document from template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully"
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error Deleting Template",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'meeting', label: 'Meeting Notes' },
    { value: 'project', label: 'Project Planning' },
    { value: 'report', label: 'Reports' },
    { value: 'proposal', label: 'Proposals' },
    { value: 'personal', label: 'Personal' }
  ];

  const predefinedTemplates = [
    {
      name: 'Meeting Notes',
      description: 'Standard meeting notes template with agenda and action items',
      category: 'meeting',
      template_data: {
        title: 'Meeting Notes - {{date}}',
        content: `# Meeting Notes

## Meeting Details
- **Date:** {{date}}
- **Time:** {{time}}
- **Location:** {{location}}
- **Attendees:** {{attendees}}

## Agenda
1. {{agenda_item_1}}
2. {{agenda_item_2}}
3. {{agenda_item_3}}

## Discussion Points
- {{discussion_point_1}}
- {{discussion_point_2}}

## Action Items
- [ ] {{action_item_1}} - Due: {{due_date}} - Assigned: {{assignee}}
- [ ] {{action_item_2}} - Due: {{due_date}} - Assigned: {{assignee}}

## Next Steps
{{next_steps}}

## Next Meeting
- **Date:** {{next_meeting_date}}
- **Time:** {{next_meeting_time}}
`,
        content_type: 'text/markdown',
        document_type: 'meeting_notes',
        metadata: { template_type: 'meeting_notes' }
      }
    },
    {
      name: 'Project Plan',
      description: 'Comprehensive project planning template',
      category: 'project',
      template_data: {
        title: 'Project Plan - {{project_name}}',
        content: `# Project Plan: {{project_name}}

## Project Overview
**Project Name:** {{project_name}}
**Project Manager:** {{project_manager}}
**Start Date:** {{start_date}}
**End Date:** {{end_date}}
**Budget:** {{budget}}

## Project Objectives
{{objectives}}

## Scope
### In Scope
- {{in_scope_1}}
- {{in_scope_2}}

### Out of Scope
- {{out_of_scope_1}}
- {{out_of_scope_2}}

## Timeline
| Phase | Start Date | End Date | Deliverables |
|-------|------------|----------|-------------|
| {{phase_1}} | {{start_1}} | {{end_1}} | {{deliverables_1}} |
| {{phase_2}} | {{start_2}} | {{end_2}} | {{deliverables_2}} |

## Resources
- {{resource_1}}
- {{resource_2}}

## Risks
| Risk | Impact | Probability | Mitigation |
|------|---------|-------------|------------|
| {{risk_1}} | {{impact_1}} | {{prob_1}} | {{mitigation_1}} |
`,
        content_type: 'text/markdown',
        document_type: 'project_plan',
        metadata: { template_type: 'project_plan' }
      }
    },
    {
      name: 'Status Report',
      description: 'Weekly/Monthly status report template',
      category: 'report',
      template_data: {
        title: 'Status Report - {{period}}',
        content: `# Status Report - {{period}}

## Executive Summary
{{executive_summary}}

## Key Accomplishments
- {{accomplishment_1}}
- {{accomplishment_2}}
- {{accomplishment_3}}

## Metrics
| Metric | Target | Actual | Status |
|--------|---------|---------|---------|
| {{metric_1}} | {{target_1}} | {{actual_1}} | {{status_1}} |
| {{metric_2}} | {{target_2}} | {{actual_2}} | {{status_2}} |

## Challenges
- {{challenge_1}}
- {{challenge_2}}

## Next Period Goals
- {{goal_1}}
- {{goal_2}}

## Support Needed
{{support_needed}}
`,
        content_type: 'text/markdown',
        document_type: 'status_report',
        metadata: { template_type: 'status_report' }
      }
    }
  ];

  const createPredefinedTemplate = async (template: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('document_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          category: template.category,
          is_public: false,
          template_data: template.template_data
        });

      if (error) throw error;

      toast({
        title: "Template Added",
        description: `${template.name} template has been added to your collection`
      });

      loadTemplates();
    } catch (error) {
      console.error('Error creating predefined template:', error);
      toast({
        title: "Error Adding Template",
        description: "Failed to add template",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
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
        <h1 className="text-2xl font-bold">Document Templates</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Describe your template"
                />
              </div>
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={newTemplate.template_data.title}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    template_data: { ...newTemplate.template_data, title: e.target.value }
                  })}
                  placeholder="Template document title"
                />
              </div>
              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.template_data.content}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    template_data: { ...newTemplate.template_data, content: e.target.value }
                  })}
                  placeholder="Enter template content (supports {{variables}})"
                  rows={10}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={newTemplate.is_public}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, is_public: checked })}
                />
                <Label htmlFor="public">Make this template public</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={createTemplate} disabled={!newTemplate.name.trim()}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Predefined Templates */}
      {templates.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add these popular templates to your collection to get started quickly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predefinedTemplates.map((template, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <Button onClick={() => createPredefinedTemplate(template)} size="sm">
                    Add Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                {template.is_public && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{template.category}</Badge>
                  <span className="text-muted-foreground">{template.usage_count} uses</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => useTemplate(template)} size="sm" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && templates.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateSystem;