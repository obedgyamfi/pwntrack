'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Project, Finding, addFinding, getFindingsByProjectId, updateProject, getProjectById, updateFinding } from '@/lib/dummy-data'; // Import updateFinding
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Plus } from 'lucide-react';

// Import reusable components
import FindingDetailView from '@/components/content/FindingDetailView';
import ProjectFormContent from '@/components/forms/ProjectFormDialog';
import FindingFormContent from '@/components/forms/FindingFormContent'; // Import FindingFormContent


interface ProjectDetailContentProps {
  initialProject: Project;
  initialFindings: Finding[];
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({ initialProject, initialFindings }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [loadingFindings, setLoadingFindings] = useState(false);

  // States for "Add/Edit Finding" dialog
  const [isFindingFormDialogOpen, setIsFindingFormDialogOpen] = useState(false); // New state for dialog
  const [editingFinding, setEditingFinding] = useState<Finding | undefined>(undefined); // New state for editing finding
  const [findingFormData, setFindingFormData] = useState<Omit<Finding, 'id' | 'reportedDate'>>({
    projectId: project.id, // Pre-fill with current project's ID
    title: '',
    severity: 'Medium',
    status: 'New',
    affectedEndpoints: [],
    description: '',
    assessmentPeriod: '',
    notes: '',
  });
  const [findingReportedDate, setFindingReportedDate] = useState<Date | undefined>(new Date());
  const [isSavingFinding, setIsSavingFinding] = useState(false); // Loading state for saving/updating finding

  // States for "View Finding" dialog
  const [isViewFindingDialogOpen, setIsViewFindingDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // States for "Edit Project" dialog
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // State for the project form data within ProjectDetailContent (for editing current project)
  const [projectFormData, setProjectFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    scope: '',
    methodology: '',
    client: '',
    startDate: undefined,
    endDate: undefined,
    status: 'Planning',
  });

  // Effect to update project and projectFormData states if initialProject prop changes
  useEffect(() => {
    setProject(initialProject);
    setProjectFormData({
        name: initialProject.name || '',
        scope: initialProject.scope || '',
        methodology: initialProject.methodology || '',
        client: initialProject.client || '',
        startDate: initialProject.startDate,
        endDate: initialProject.endDate,
        status: initialProject.status || 'Planning',
    });
  }, [initialProject]);

  // Effect to update finding form data when editingFinding changes (for pre-filling form)
  useEffect(() => {
    if (editingFinding) {
      setFindingFormData({
        projectId: editingFinding.projectId,
        title: editingFinding.title,
        severity: editingFinding.severity,
        status: editingFinding.status,
        affectedEndpoints: editingFinding.affectedEndpoints,
        description: editingFinding.description,
        assessmentPeriod: editingFinding.assessmentPeriod,
        notes: editingFinding.notes,
      });
      setFindingReportedDate(editingFinding.reportedDate);
    } else {
      // Reset form if no editingFinding (for "Add New") but keep projectId
      setFindingFormData(prev => ({
        ...prev,
        title: '',
        severity: 'Medium',
        status: 'New',
        affectedEndpoints: [],
        description: '',
        assessmentPeriod: '',
        notes: '',
      }));
      setFindingReportedDate(new Date());
    }
  }, [editingFinding, isFindingFormDialogOpen, project.id]); // Add project.id to dependencies

  // Fetch findings for this project whenever needed (e.g., component mount, after add/edit finding)
  const fetchProjectFindings = useCallback(async () => {
    setLoadingFindings(true);
    try {
      const updatedFindings = await getFindingsByProjectId(project.id);
      setFindings(updatedFindings);
    } catch (error) {
      console.error("Failed to fetch updated findings for project:", error);
    } finally {
      setLoadingFindings(false);
    }
  }, [project.id]);

  // Get unique assessment periods for filtering
  const uniquePeriods = Array.from(new Set(findings.map(f => f.assessmentPeriod)));

  // Filtered findings based on search term and selected period
  const filteredFindings = findings.filter(finding => {
    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          finding.affectedEndpoints.some(ep => ep.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPeriod = selectedPeriod === '' || finding.assessmentPeriod === selectedPeriod;
    return matchesSearch && matchesPeriod;
  });

  // Helper function for styling severity badges
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

  // Handlers for New/Edit Finding form
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
    if (!findingFormData.title.trim()) {
      console.error("Finding title cannot be empty.");
      return;
    }

    setIsSavingFinding(true);
    try {
      const fullFindingData: Omit<Finding, 'id'> = {
        ...findingFormData,
        reportedDate: findingReportedDate || new Date(),
      };

      if (editingFinding) {
        const updated = await updateFinding(editingFinding.id, fullFindingData);
        if (updated) {
          console.log('Finding updated via dummy API:', updated);
        } else {
          throw new Error('Finding not found for update.');
        }
      } else {
        const saved = await addFinding(fullFindingData);
        console.log('Finding added via dummy API:', saved);
      }

      await fetchProjectFindings(); // Re-fetch findings for THIS project to update the list
      setIsFindingFormDialogOpen(false); // Close dialog
      setEditingFinding(undefined); // Clear editing state

    } catch (err) {
      console.error("Failed to save/update finding:", err);
      // Handle error display
    } finally {
      setIsSavingFinding(false);
    }
  };

  // Function to open the "View Finding" dialog
  const handleViewFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsViewFindingDialogOpen(true);
  };

  // Function to open the "Add New Finding" dialog (pre-fills project)
  const handleAddFindingClick = () => {
    setEditingFinding(undefined); // Clear any existing editing context
    setFindingFormData(prev => ({ ...prev, projectId: project.id })); // Ensure project ID is set
    setFindingReportedDate(new Date()); // Reset date
    setIsFindingFormDialogOpen(true);
  };

  // Function to open the "Edit Finding" dialog
  const handleEditFindingClick = (findingToEdit: Finding) => {
    setEditingFinding(findingToEdit); // Set the finding data for the form
    setIsFindingFormDialogOpen(true); // Open the dialog
  };

  // Handlers for editing project details (from ProjectFormContent)
  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProjectFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProjectSelectChange = (id: string, value: string) => {
    setProjectFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProjectDateChange = (id: string, date: Date | undefined) => {
    setProjectFormData(prev => ({ ...prev, [id]: date }));
  };

  const handleSaveProject = async () => {
    if (!projectFormData.name.trim()) {
      console.error("Project name cannot be empty.");
      return;
    }
    setIsSavingProject(true);
    try {
      const updated = await updateProject(project.id, projectFormData);
      if (updated) {
        console.log('Project updated via dummy API:', updated);
        setProject(updated); // Update local state with the new project data
      } else {
        throw new Error('Project not found for update.');
      }
      setIsEditProjectDialogOpen(false);
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setIsSavingProject(false);
    }
  };

  const projectDialogTitle = "Edit Project";
  const projectDialogDescription = `Edit the details for "${project.name}".`;
  const projectSubmitButtonText = "Save Changes";

  const findingDialogTitle = editingFinding ? 'Edit Finding' : `Add New Finding to "${project.name}"`;
  const findingDialogDescription = editingFinding
    ? `Edit the details for "${editingFinding.title}".`
    : 'Enter the details for the new vulnerability finding.';
  const findingSubmitButtonText = editingFinding ? 'Save Changes' : 'Add Finding';


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">{project.client} | Status: <Badge variant="outline">{project.status}</Badge></p>

      {/* Action Buttons for the project */}
      <div className="flex gap-2">
        {/* Edit Project Button and Dialog Trigger */}
        <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsEditProjectDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{projectDialogTitle}</DialogTitle>
              <DialogDescription>{projectDialogDescription}</DialogDescription>
            </DialogHeader>
            <ProjectFormContent
              formData={projectFormData}
              handleInputChange={handleProjectInputChange}
              handleSelectChange={handleProjectSelectChange}
              handleDateChange={handleProjectDateChange}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProjectDialogOpen(false)} disabled={isSavingProject}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={!projectFormData.name.trim() || isSavingProject}>
                {isSavingProject ? 'Saving Changes...' : projectSubmitButtonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Finding Dialog Trigger (for project-specific findings) */}
        <Dialog open={isFindingFormDialogOpen} onOpenChange={setIsFindingFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddFindingClick}>
              <Plus className="mr-2 h-4 w-4" /> Add New Finding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{findingDialogTitle}</DialogTitle>
              <DialogDescription>{findingDialogDescription}</DialogDescription>
            </DialogHeader>
            <FindingFormContent
              formData={findingFormData}
              reportedDate={findingReportedDate}
              handleInputChange={handleFindingInputChange}
              handleSelectChange={handleFindingSelectChange}
              handleDateChange={handleFindingDateChange}
              availableProjects={[project]} // Only the current project is available here
              isProjectFieldDisabled={true} // Disable project selection
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFindingFormDialogOpen(false)} disabled={isSavingFinding}>
                Cancel
              </Button>
              <Button onClick={handleSaveFinding} disabled={!findingFormData.title.trim() || !findingFormData.projectId || isSavingFinding}>
                {isSavingFinding ? (editingFinding ? 'Saving Changes...' : 'Adding...') : findingSubmitButtonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="secondary">Generate Report</Button>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings ({findings.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Detailed information about this assessment project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Scope:</h4>
                <p className="text-muted-foreground">{project.scope || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Methodology:</h4>
                <p className="text-muted-foreground">{project.methodology || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Client:</h4>
                <p className="text-muted-foreground">{project.client || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Dates:</h4>
                <p className="text-muted-foreground">
                  Start: {project.startDate ? format(project.startDate, "PPP") : 'N/A'} |
                  End: {project.endDate ? format(project.endDate, "PPP") : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Status:</h4>
                <Badge variant="outline">{project.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Findings for {project.name}</CardTitle>
              <CardDescription>All vulnerabilities identified during this assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
                <Input
                  placeholder="Search findings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {uniquePeriods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => { setSearchTerm(''); setSelectedPeriod(''); }}>Clear Filters</Button>
              </div>

              {loadingFindings ? (
                <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
                  Loading findings...
                </div>
              ) : filteredFindings.length === 0 ? (
                <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
                  No findings match your filters for this project.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Affected Endpoints</TableHead>
                      <TableHead>Reported Date</TableHead>
                      <TableHead>Assessment Period</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFindings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell className="font-medium">{finding.title}</TableCell>
                        <TableCell><Badge className={getSeverityBadgeClass(finding.severity)}>{finding.severity}</Badge></TableCell>
                        <TableCell>{finding.status}</TableCell>
                        <TableCell className="text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {finding.affectedEndpoints.join(', ')}
                        </TableCell>
                        <TableCell>{format(finding.reportedDate, "PPP")}</TableCell>
                        <TableCell>{finding.assessmentPeriod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewFinding(finding)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditFindingClick(finding)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Project Notes</CardTitle>
              <CardDescription>Add and manage notes specific to this project.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
                (Placeholder for Notes Section)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Project Reports</CardTitle>
              <CardDescription>Generate and view reports for this project.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
                (Placeholder for Reports Section)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Finding Details Dialog (for Project Detail Page) */}
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
              projectName={project.name}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewFindingDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetailContent;
