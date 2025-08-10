'use client'; // This component uses client-side hooks

import React, { useState, useEffect, useCallback } from 'react';
import { Project, Finding, addFinding, getFindingsByProjectId } from '@/lib/dummy-data'; // Import addFinding and getFindingsByProjectId
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // For date picker
import { Calendar } from '@/components/ui/calendar'; // For date picker
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'; // For add finding dialog
import { Label } from '@/components/ui/label'; // For form labels
import { Textarea } from '@/components/ui/textarea'; // For multi-line text input
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react'; // For calendar icon

// Ensure you have these Shadcn UI components installed:
// npx shadcn-ui@latest add tabs badge table input select popover calendar dialog label textarea

interface ProjectDetailContentProps {
  project: Project;
  initialFindings: Finding[]; // Findings fetched by the server component
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({ project, initialFindings }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [findings, setFindings] = useState<Finding[]>(initialFindings); // Use state to manage findings, initialized from props
  const [loadingFindings, setLoadingFindings] = useState(false); // Loading state specifically for findings tab

  // State for "Add New Finding" dialog
  const [isAddFindingDialogOpen, setIsAddFindingDialogOpen] = useState(false);
  const [newFindingFormData, setNewFindingFormData] = useState<Omit<Finding, 'id' | 'reportedDate'>>({
    projectId: project.id, // Pre-fill with current project's ID
    title: '',
    severity: 'Medium',
    status: 'New',
    affectedEndpoints: [],
    description: '',
    assessmentPeriod: '',
    notes: '',
  });
  const [newFindingReportedDate, setNewFindingReportedDate] = useState<Date | undefined>(new Date());
  const [addingFinding, setAddingFinding] = useState(false); // Loading state for adding a finding

  // Fetch findings for this project whenever the component mounts or project changes (shouldn't change much here)
  // or after a new finding is added.
  const fetchProjectFindings = useCallback(async () => {
    setLoadingFindings(true);
    try {
      const updatedFindings = await getFindingsByProjectId(project.id);
      setFindings(updatedFindings);
    } catch (error) {
      console.error("Failed to fetch updated findings for project:", error);
      // Handle error display
    } finally {
      setLoadingFindings(false);
    }
  }, [project.id]); // Re-create if project ID changes


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

  // Helper for severity badge styling
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

  // Handlers for New Finding form
  const handleNewFindingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewFindingFormData(prev => {
      if (id === 'affectedEndpoints') {
        return { ...prev, affectedEndpoints: value.split(',').map(item => item.trim()).filter(item => item !== '') };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleNewFindingSelectChange = (id: keyof Omit<Finding, 'id' | 'reportedDate'>, value: string) => {
    setNewFindingFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleSaveNewFinding = async () => {
    if (!newFindingFormData.title.trim()) { // ProjectId is already pre-filled and not changeable here
      console.error("Finding title cannot be empty.");
      return;
    }

    try {
      setAddingFinding(true);
      const fullNewFinding: Omit<Finding, 'id'> = {
        ...newFindingFormData,
        reportedDate: newFindingReportedDate || new Date(),
      };
      const savedFinding = await addFinding(fullNewFinding);
      console.log('Finding saved via dummy API:', savedFinding);

      await fetchProjectFindings(); // Re-fetch findings for THIS project
      setIsAddFindingDialogOpen(false); // Close dialog

      // Reset form (except projectId)
      setNewFindingFormData(prev => ({
        ...prev,
        title: '',
        severity: 'Medium',
        status: 'New',
        affectedEndpoints: [],
        description: '',
        assessmentPeriod: '',
        notes: '',
      }));
      setNewFindingReportedDate(new Date());
    } catch (err) {
      console.error("Failed to save finding:", err);
      // Handle error display
    } finally {
      setAddingFinding(false);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">{project.client} | Status: <Badge variant="outline">{project.status}</Badge></p>

      {/* Action Buttons for the project */}
      <div className="flex gap-2">
        <Button variant="outline">Edit Project</Button>

        {/* Dialog Trigger for Add New Finding */}
        <Dialog open={isAddFindingDialogOpen} onOpenChange={setIsAddFindingDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Finding</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Finding to "{project.name}"</DialogTitle>
              <DialogDescription>
                Enter the details for the new vulnerability finding.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Associated Project (Displayed but disabled/read-only) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectId" className="text-right">
                  Project
                </Label>
                <Input
                  id="projectId"
                  value={project.name} // Display project name
                  className="col-span-3 bg-muted"
                  readOnly // Make it read-only
                />
                {/* Hidden input for the actual projectId value if needed by form submission logic */}
                <input type="hidden" name="projectId" value={project.id} />
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
                  value={newFindingFormData.affectedEndpoints.join(', ')}
                  onChange={handleNewFindingInputChange}
                  className="col-span-3"
                  placeholder="e.g., /api/login, /admin/users, /dashboard (comma-separated)"
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
                      autoFocus
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
              <Button variant="outline" onClick={() => setIsAddFindingDialogOpen(false)} disabled={addingFinding}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewFinding} disabled={!newFindingFormData.title.trim() || addingFinding}>
                {addingFinding ? 'Adding...' : 'Add Finding'}
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
                  Start: {project.startDate ? format(project.startDate, 'PPP') : 'N/A'} |
                  End: {project.endDate ? format(project.endDate, 'PPP') : 'N/A'}
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
                        <TableCell>{format(finding.reportedDate, 'MMM d, yyyy')}</TableCell>
                        <TableCell>{finding.assessmentPeriod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
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
    </div>
  );
};

export default ProjectDetailContent;
