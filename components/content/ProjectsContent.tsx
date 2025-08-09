'use client';

import React, { useState } from 'react';
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

// import the porject type from dummy-data 
import { Project } from '@/lib/dummy-data';
// Define a type for a Project object for better type safety
// interface Project {
//   id: string; // Unique ID for each project
//   name: string;
//   scope: string;
//   methodology: string;
//   client: string;
//   startDate?: Date;
//   endDate?: Date;
//   status: string;
// }

const ProjectsContent = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // State to hold all projects, initialized as an empty array
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({ // Omit 'id' as it's generated on save
    name: '',
    scope: '',
    methodology: '',
    client: '',
    startDate: undefined,
    endDate: undefined,
    status: 'Planning',
  });

  React.useEffect(() => {
    // Simulate fetching projects
    const dummyProjects = [
      {
        id: 'proj-1',
        name: 'Acme Corp Web Application',
        scope: 'Public-facing web application at acme.com. Focus on authentication, user management, and payment processing.',
        methodology: 'Grey-box',
        client: 'Acme Corp',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-28'),
        status: 'Completed',
      },
      {
        id: 'proj-2',
        name: 'Internal HR System Audit',
        scope: 'Internal web application for HR data management. All features in scope.',
        methodology: 'White-box',
        client: 'Internal IT',
        startDate: new Date('2025-03-01'),
        endDate: undefined,
        status: 'Active',
      },
      {
        id: 'proj-3',
        name: 'Mobile App V2 Assessment',
        scope: 'iOS and Android mobile applications (versions 2.0.0 and above). APIs at api.acme.com/v2 included.',
        methodology: 'Black-box',
        client: 'Acme Corp',
        startDate: new Date('2025-04-10'),
        endDate: undefined,
        status: 'Planning',
      },
    ];
    setProjects(dummyProjects);
  }, []);

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

  const handleSaveNewProject = () => {
    if (!formData.name.trim()) {
      console.error("Project name cannot be empty.");
      return;
    }

    // Create a new project object with a unique ID (for now, a simple timestamp)
    const newProject: Project = {
      id: `proj-${Date.now()}`, // Simple unique ID for in-memory
      ...formData,
    };

    // Add the new project to the projects array
    setProjects(prevProjects => [...prevProjects, newProject]);

    console.log('New project added:', newProject);

    // Reset form and close dialog
    setFormData({
      name: '',
      scope: '',
      methodology: '',
      client: '',
      startDate: undefined,
      endDate: undefined,
      status: 'Planning',
    });
    setIsDialogOpen(false);
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewProject} disabled={!formData.name.trim()}>
              Save Project
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
          {projects.length === 0 ? (
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
                  {/* Link to the dedicated project detail page */}
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
