'use client'; // This component uses client-side hooks

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Bug, Edit, Trash2 } from 'lucide-react'; // Added Edit icon
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import { format } from 'date-fns';

// Import API functions and types
import { getFindings, Finding, getProjects, Project, addFinding, updateFinding, deleteFinding } from '@/lib/dummy-data'; // Import updateFinding

// Import the reusable FindingDetailView component
import FindingDetailView from '@/components/content/FindingDetailView';
// Import the reusable FindingFormContent component
import FindingFormContent from '@/components/forms/FindingFormContent';


const FindingsContent = () => {
  const [isFindingFormDialogOpen, setIsFindingFormDialogOpen] = useState(false); // Controls the FindingFormContent dialog
  const [editingFinding, setEditingFinding] = useState<Finding | undefined>(undefined); // Holds data for the finding being edited

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Controls the delete confirmation dialog
  const [findingToDelete, setFindingToDelete] = useState<Finding | null>(null);

  const [isViewFindingDialogOpen, setIsViewFindingDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | undefined>(undefined);

  const [findings, setFindings] = useState<Finding[]>([]);
  const [projectsMap, setProjectsMap] = useState<Map<string, string>>(new Map()); // Map projectId to projectName
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]); // To populate project dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingFinding, setIsSavingFinding] = useState(false); // Loading state for saving/updating finding

  // State for new/editing finding form data
  const [findingFormData, setFindingFormData] = useState<Omit<Finding, 'id' | 'reportedDate'>>({
    projectId: '',
    title: '',
    severity: 'Medium',
    status: 'New',
    affectedEndpoints: [],
    description: '',
    assessmentPeriod: '',
    notes: '',
  });
  const [findingReportedDate, setFindingReportedDate] = useState<Date | undefined>(new Date());

  const fetchFindingsAndProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedFindings = await getFindings();
      setFindings(fetchedFindings);

      const fetchedProjects = await getProjects();
      const map = new Map<string, string>();
      fetchedProjects.forEach(p => map.set(p.id, p.name));
      setProjectsMap(map);
      setAvailableProjects(fetchedProjects);

    } catch (err) {
      console.error("Failed to fetch data for findings page:", err);
      setError("Failed to load findings and projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindingsAndProjects();
  }, [fetchFindingsAndProjects]);

  // Effect to update form data when editingFinding changes (for pre-filling form)
  useEffect(() => {
    if (editingFinding) {
      setFindingFormData({
        projectId: editingFinding.projectId || '',
        title: editingFinding.title || '',
        severity: editingFinding.severity || 'Medium',
        status: editingFinding.status || 'New',
        affectedEndpoints: editingFinding.affectedEndpoints || [],
        description: editingFinding.description || '',
        assessmentPeriod: editingFinding.assessmentPeriod || '',
        notes: editingFinding.notes || '',
      });
      setFindingReportedDate(editingFinding.reportedDate);
    } else {
      // Reset form if no editingFinding (for "Add New")
      setFindingFormData({
        projectId: '',
        title: '',
        severity: 'Medium',
        status: 'New',
        affectedEndpoints: [],
        description: '',
        assessmentPeriod: '',
        notes: '',
      });
      setFindingReportedDate(new Date());
    }
  }, [editingFinding, isFindingFormDialogOpen]); // Re-run when editingFinding changes or dialog opens/closes

  const handleFindingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFindingFormData(prev => {
      if (id === 'affectedEndpoints') {
        return { ...prev, affectedEndpoints: value.split(',').map(item => item.trim()).filter(item => item !== '') };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleFindingSelectChange = (id: keyof Omit<Finding, 'id' | 'reportedDate'>, value: string) => {
    setFindingFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleFindingDateChange = (date: Date | undefined) => {
    setFindingReportedDate(date);
  };

  const handleSaveFinding = async () => {
    if (!findingFormData.title.trim() || !findingFormData.projectId) {
      console.error("Finding title and associated project cannot be empty.");
      return;
    }

    setIsSavingFinding(true);
    setError(null);
    try {
      const fullFindingData: Omit<Finding, 'id'> = {
        ...findingFormData,
        reportedDate: findingReportedDate || new Date(), // Use selected date or current date
      };

      if (editingFinding) {
        // Editing existing finding
        const updated = await updateFinding(editingFinding.id, fullFindingData);
        if (updated) {
          console.log('Finding updated via dummy API:', updated);
        } else {
          throw new Error('Finding not found for update.');
        }
      } else {
        // Adding new finding
        const saved = await addFinding(fullFindingData);
        console.log('Finding added via dummy API:', saved);
      }

      await fetchFindingsAndProjects(); // Re-fetch all findings and projects to update the lists
      setIsFindingFormDialogOpen(false); // Close dialog
      setEditingFinding(undefined); // Clear editing state

    } catch (err) {
      console.error("Failed to save/update finding:", err);
      setError(`Failed to ${editingFinding ? 'update' : 'add'} finding. Please try again.`);
    } finally {
      setIsSavingFinding(false);
    }
  };

  // Function to open the view dialog and set the selected finding
  const handleViewFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsViewFindingDialogOpen(true);
  };

  const handleAddFindingClick = () => {
    setEditingFinding(undefined); // Ensure no initial data for "Add New"
    setIsFindingFormDialogOpen(true);
  };

  const handleEditFindingClick = (findingToEdit: Finding) => {
    setEditingFinding(findingToEdit); // Set the finding data for the form
    setIsFindingFormDialogOpen(true); // Open the dialog
  };

  const handleDeleteFinding = async () => {
    if (!findingToDelete) return;

    try {
      await deleteFinding(findingToDelete.id); // Call the delete API
      await fetchFindingsAndProjects(); // Refresh findings list
      setIsDeleteDialogOpen(false); // Close the delete dialog
    } catch (error) {
      console.error("Failed to delete finding:", error);
    }
  };

  const dialogTitle = editingFinding ? 'Edit Finding' : 'Add New Finding';
  const dialogDescription = editingFinding
    ? `Edit the details for "${editingFinding.title}".`
    : 'Enter the details for the new vulnerability finding.';
  const submitButtonText = editingFinding ? 'Save Changes' : 'Add Finding';

  const getSeverityBadgeClass = (severity: Finding['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-yellow-500 text-black';
      case 'Informational': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading findings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-[500px]">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Findings</h1>
      <p className="text-muted-foreground">View and manage all your reported vulnerabilities.</p>

      {/* Add/Edit Finding Dialog Trigger */}
      <Dialog open={isFindingFormDialogOpen} onOpenChange={setIsFindingFormDialogOpen}>
        <DialogTrigger >
          <Button onClick={handleAddFindingClick}>
            <Plus className="mr-2 h-4 w-4" /> Add New Finding
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <FindingFormContent
            formData={findingFormData}
            reportedDate={findingReportedDate}
            handleInputChange={handleFindingInputChange}
            handleSelectChange={handleFindingSelectChange}
            handleDateChange={handleFindingDateChange}
            availableProjects={availableProjects} // Pass available projects for dropdown
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFindingFormDialogOpen(false)} disabled={isSavingFinding}>
              Cancel
            </Button>
            <Button onClick={handleSaveFinding} disabled={!findingFormData.title.trim() || !findingFormData.projectId || isSavingFinding}>
              {isSavingFinding ? (editingFinding ? 'Saving Changes...' : 'Adding...') : submitButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Global Findings List Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Vulnerability Findings</CardTitle>
          <CardDescription>A comprehensive list of all vulnerabilities across all projects.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
              Loading findings...
            </div>
          ) : error ? (
            <div className="text-destructive h-48 flex items-center justify-center border rounded-md">
              Error: {error}
            </div>
          ) : findings.length === 0 ? (
            <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
              No findings recorded yet. Click "Add New Finding" to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Affected Endpoints</TableHead>
                  <TableHead>Reported Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell className="font-medium">{finding.title}</TableCell>
                    <TableCell>{projectsMap.get(finding.projectId) || 'N/A'}</TableCell>
                    <TableCell><Badge className={getSeverityBadgeClass(finding.severity)}>{finding.severity}</Badge></TableCell>
                    <TableCell>{finding.status}</TableCell>
                    <TableCell className="text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {finding.affectedEndpoints.join(', ')}
                    </TableCell>
                    <TableCell>{format(finding.reportedDate, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewFinding(finding)}>View</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditFindingClick(finding)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                        <AlertDialogTrigger onClick={() => {
                          setFindingToDelete(finding); 
                          setIsDeleteDialogOpen(true);
                          }}>
                          <Button variant="ghost" size="sm" onClick={() => setFindingToDelete(finding)}>
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </AlertDialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Finding Details Dialog */}
      <Dialog open={isViewFindingDialogOpen} onOpenChange={setIsViewFindingDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedFinding?.title || 'Finding Details'}</DialogTitle>
            <DialogDescription>
              Comprehensive information about this vulnerability.
            </DialogDescription>
          </DialogHeader>
          {selectedFinding && (
            <FindingDetailView
              finding={selectedFinding}
              projectName={projectsMap.get(selectedFinding.projectId)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewFindingDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Dialog delete confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the finding
              "{findingToDelete?.title}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFindingToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFinding}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

FindingsContent.icon = Bug;

export default FindingsContent;
