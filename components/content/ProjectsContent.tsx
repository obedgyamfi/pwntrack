'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Folder, Edit, Trash2 } from 'lucide-react';
import {
  Dialog, // Import Dialog
  DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { format } from 'date-fns';

// Import the Project type and API functions
import { Project, getProjects, addProject, updateProject, deleteProject } from '@/lib/dummy-data';

// Import the reusable ProjectFormContent (renamed from ProjectFormDialog)
import ProjectFormContent from '@/components/forms/ProjectFormDialog'; // Note: filename is ProjectFormDialog.tsx, but component export is ProjectFormContent


const ProjectsContent = () => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // State for the form data within ProjectsContent
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
  }, []);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Effect to update form data when editingProject changes (for pre-filling form)
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name || '',
        scope: editingProject.scope || '',
        methodology: editingProject.methodology || '',
        client: editingProject.client || '',
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
        status: editingProject.status || 'Planning',
      });
    } else {
      // Reset form if no editingProject (for "Add New")
      setFormData({
        name: '',
        scope: '',
        methodology: '',
        client: '',
        startDate: undefined,
        endDate: undefined,
        status: 'Planning',
      });
    }
  }, [editingProject, isFormDialogOpen]); // Re-run when editingProject changes or dialog opens/closes

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

  const handleSaveProject = async () => {
    if (!formData.name.trim()) {
      console.error("Project name cannot be empty.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingProject) {
        // Editing existing project
        const updated = await updateProject(editingProject.id, formData);
        if (updated) {
          console.log('Project updated via dummy API:', updated);
        } else {
          throw new Error('Project not found for update.');
        }
      } else {
        // Adding new project
        const saved = await addProject(formData);
        console.log('Project added via dummy API:', saved);
      }
      await fetchProjects(); // Re-fetch all projects to update the list
      setIsFormDialogOpen(false); // Close dialog
      setEditingProject(undefined); // Clear editing state
    } catch (err) {
      console.error("Failed to save/update project:", err);
      setError(`Failed to ${editingProject ? 'update' : 'add'} project. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProjectClick = () => {
    setEditingProject(undefined); // Ensure no initial data for "Add New"
    setIsFormDialogOpen(true);
  };

  const handleEditProjectClick = (projectToEdit: Project) => {
    setEditingProject(projectToEdit); // Set the project data for the form
    setIsFormDialogOpen(true); // Open the dialog
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      await fetchProjects(); //re-fetch to update the list
      setIsDeleteProjectDialogOpen(false); // close the dialog
      setProjectToDelete(null); // reset the project to delete
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project. Please try again.");
    }
  }

  const dialogTitle = editingProject ? 'Edit Project' : 'Add New Project';
  const dialogDescription = editingProject
    ? `Edit the details for "${editingProject.name}".`
    : 'Enter the details for your new vulnerability assessment project.';
  const submitButtonText = editingProject ? 'Save Changes' : 'Save Project';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-muted-foreground">Manage all your vulnerability assessment projects.</p>

      {/* Button to open Add/Edit Project Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}> {/* Dialog wrapper here */}
        <DialogTrigger asChild>
          <Button onClick={handleAddProjectClick}>
            <Plus className="mr-2 h-4 w-4" /> Add New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <ProjectFormContent // Render the content component inside DialogContent
            formData={formData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleDateChange={handleDateChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={!formData.name.trim() || isSaving}>
              {isSaving ? (editingProject ? 'Saving Changes...' : 'Saving Project...') : submitButtonText}
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
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} passHref>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleEditProjectClick(project)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setProjectToDelete(project);
                          setIsDeleteProjectDialogOpen(true);
                        }}>
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the finding "{projectToDelete?.name}" from the database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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
