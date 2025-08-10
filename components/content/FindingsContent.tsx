'use client'; // This component uses client-side hooks

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Bug, CalendarIcon } from 'lucide-react'; // Added CalendarIcon
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Import API functions and types
import { getFindings, Finding, getProjects, Project, addFinding } from '@/lib/dummy-data';

const FindingsContent = () => {
  const [isAddFindingDialogOpen, setIsAddFindingDialogOpen] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [projectsMap, setProjectsMap] = useState<Map<string, string>>(new Map()); // Map projectId to projectName
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]); // To populate project dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for new finding form data
  const [newFindingFormData, setNewFindingFormData] = useState<Omit<Finding, 'id' | 'reportedDate'>>({
    projectId: '',
    title: '',
    severity: 'Medium', // Default severity
    status: 'New',     // Default status
    affectedEndpoints: [],
    description: '',
    assessmentPeriod: '',
    notes: '',
  });
  const [newFindingReportedDate, setNewFindingReportedDate] = useState<Date | undefined>(new Date());

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
      setAvailableProjects(fetchedProjects); // Store projects for the dropdown

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

  const handleNewFindingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewFindingFormData(prev => {
      // Handle affectedEndpoints as a comma-separated string
      if (id === 'affectedEndpoints') {
        return { ...prev, affectedEndpoints: value.split(',').map(item => item.trim()).filter(item => item !== '') };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleNewFindingSelectChange = (id: keyof Omit<Finding, 'id' | 'reportedDate'>, value: string) => {
    setNewFindingFormData(prev => ({ ...prev, [id]: value as any })); // Type assertion for severity/status
  };

  const handleSaveNewFinding = async () => {
    if (!newFindingFormData.title.trim() || !newFindingFormData.projectId) {
      // Basic validation: ensure title and project are selected
      console.error("Finding title and associated project cannot be empty.");
      // You might want to show a toast or validation message to the user
      return;
    }

    try {
      setLoading(true); // Indicate saving is in progress
      const fullNewFinding: Omit<Finding, 'id'> = {
        ...newFindingFormData,
        reportedDate: newFindingReportedDate || new Date(), // Use selected date or current date
      };
      const savedFinding = await addFinding(fullNewFinding); // Call the fake API to add
      console.log('Finding saved via dummy API:', savedFinding);

      await fetchFindingsAndProjects(); // Re-fetch all findings and projects to update the lists
      setIsAddFindingDialogOpen(false); // Close dialog

      // Reset form
      setNewFindingFormData({
        projectId: '',
        title: '',
        severity: 'Medium',
        status: 'New',
        affectedEndpoints: [],
        description: '',
        assessmentPeriod: '',
        notes: '',
      });
      setNewFindingReportedDate(new Date()); // Reset date
    } catch (err) {
      console.error("Failed to save finding:", err);
      setError("Failed to save finding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function for styling severity badges (kept here for modularity, can be global util)
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

      {/* Add New Finding Dialog Trigger */}
      <Dialog open={isAddFindingDialogOpen} onOpenChange={setIsAddFindingDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Finding
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]"> {/* Adjusted max-width for more fields */}
          <DialogHeader>
            <DialogTitle>Add New Finding</DialogTitle>
            <DialogDescription>
              Enter the details for the new vulnerability finding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Associated Project */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectId" className="text-right">
                Project
              </Label>
              <Select onValueChange={(value) => handleNewFindingSelectChange('projectId', value)} value={newFindingFormData.projectId}>
                <SelectTrigger id="projectId" className="col-span-3">
                  <SelectValue placeholder="Select associated project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.length === 0 ? (
                    <SelectItem value="" disabled>No projects available</SelectItem>
                  ) : (
                    <>
                      {availableProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newFindingFormData.title}
                onChange={handleNewFindingInputChange}
                className="col-span-3"
                placeholder="e.g., SQL Injection in Login"
              />
            </div>

            {/* Severity */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severity
              </Label>
              <Select onValueChange={(value) => handleNewFindingSelectChange('severity', value)} value={newFindingFormData.severity}>
                <SelectTrigger id="severity" className="col-span-3">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Informational">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => handleNewFindingSelectChange('status', value)} value={newFindingFormData.status}>
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Triaged">Triaged</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Pending Fix">Pending Fix</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Affected Endpoints */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="affectedEndpoints" className="text-right pt-2">
                Affected Endpoints
              </Label>
              <Textarea
                id="affectedEndpoints"
                value={newFindingFormData.affectedEndpoints.join(', ')} // Display as comma-separated
                onChange={handleNewFindingInputChange}
                className="col-span-3"
                placeholder="e.g., /api/login, /admin/users, /dashboard"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newFindingFormData.description}
                onChange={handleNewFindingInputChange}
                className="col-span-3 min-h-[80px]"
                placeholder="Detailed explanation of the vulnerability, including technical background and impact."
              />
            </div>

            {/* Reported Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportedDate" className="text-right">
                Reported Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 w-full justify-start text-left font-normal ${!newFindingReportedDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newFindingReportedDate ? format(newFindingReportedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newFindingReportedDate}
                    onSelect={setNewFindingReportedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assessment Period */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assessmentPeriod" className="text-right">
                Assessment Period
              </Label>
              <Input
                id="assessmentPeriod"
                value={newFindingFormData.assessmentPeriod}
                onChange={handleNewFindingInputChange}
                className="col-span-3"
                placeholder="e.g., Q1 2025 Assessment, May 2025 Retest"
              />
            </div>

            {/* Notes */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newFindingFormData.notes}
                onChange={handleNewFindingInputChange}
                className="col-span-3 min-h-[60px]"
                placeholder="Any private notes, research links, or internal comments about this finding."
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFindingDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewFinding} disabled={!newFindingFormData.title.trim() || !newFindingFormData.projectId || loading}>
              {loading ? 'Adding...' : 'Add Finding'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Findings List Card (existing content) */}
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
                      <Button variant="ghost" size="sm">View</Button>
                      {/* Add more actions like Edit, Delete here */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

FindingsContent.icon = Bug;

export default FindingsContent;
