'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Folder, CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import Link from 'next/link';

// Import the Project type and API functions
import { Project, getProjects, addProject } from '@/lib/dummy-data';

const ProjectsContent = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    scope: '',
    methodology: '',
    client: '',
    startDate: undefined,
    endDate: undefined,
    status: 'Planning',
  });

  // Function to fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is stable and won't re-create unnecessarily

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Depend on fetchProjects

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (id: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [id]: date }));
  };

  const handleSaveNewProject = async () => {
    if (!formData.name.trim()) {
      console.error("Project name cannot be empty.");
      // You might want to show a toast or validation message to the user
      return;
    }

    try {
      setLoading(true); // Indicate saving is in progress
      const savedProject = await addProject(formData); // Call the fake API to add
      console.log('Project saved via dummy API:', savedProject);

      // Re-fetch all projects to update the list, or directly add to state
      // Re-fetching is safer as it reflects the "source of truth"
      await fetchProjects(); // Re-fetch all projects after adding
      setIsDialogOpen(false); // Close dialog

      // Reset form
      setFormData({
        name: '',
        scope: '',
        methodology: '',
        client: '',
        startDate: undefined,
        endDate: undefined,
        status: 'Planning',
      });
    } catch (err) {
      console.error("Failed to save project:", err);
      setError("Failed to save project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-muted-foreground">Manage all your vulnerability assessment projects.</p>

      {/* Dialog Trigger Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new vulnerability assessment project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Project Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Project Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Acme Corp Web App V1"
              />
            </div>

            {/* Target/Scope Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="scope" className="text-right pt-2">
                Scope
              </Label>
              <Textarea
                id="scope"
                value={formData.scope}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Describe the application/system, key features, and in-scope assets (e.g., 'Public-facing web application at example.com, excluding API. Focus on authentication and payment processing.')"
              />
            </div>

            {/* Methodology */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="methodology" className="text-right">
                Methodology
              </Label>
              <Select onValueChange={(value) => handleSelectChange('methodology', value)} value={formData.methodology}>
                <SelectTrigger id="methodology" className="col-span-3">
                  <SelectValue placeholder="Select methodology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black-box">Black-box</SelectItem>
                  <SelectItem value="Grey-box">Grey-box</SelectItem>
                  <SelectItem value="White-box">White-box</SelectItem>
                  <SelectItem value="Internal">Internal Assessment</SelectItem>
                  <SelectItem value="External">External Assessment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client/Organization Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client / Org
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Acme Corporation"
              />
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 w-full justify-start text-left font-normal ${!formData.startDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleDateChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 w-full justify-start text-left font-normal ${!formData.endDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleDateChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select project status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewProject} disabled={!formData.name.trim() || loading}>
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>Overview of your active and completed projects.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
              Loading projects...
            </div>
          ) : error ? (
            <div className="text-destructive h-48 flex items-center justify-center border rounded-md">
              Error: {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
              No projects added yet. Click "Add New Project" to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="p-4 border rounded-md flex justify-between items-center bg-secondary/10">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">Status: {project.status} | Client: {project.client}</p>
                    <p className="text-xs text-muted-foreground">
                      Starts: {project.startDate ? format(project.startDate, 'MMM d, yyyy') : 'N/A'} | Ends: {project.endDate ? format(project.endDate, 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <Link href={`/projects/${project.id}`} passHref>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

ProjectsContent.icon = Folder;

export default ProjectsContent;
