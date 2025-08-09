'use client'; // This component uses client-side hooks

import React, { useState } from 'react';
import { Project, Finding } from '@/lib/dummy-data'; // Import types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // For status badges
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // For findings table
import { Input } from '@/components/ui/input'; // For search input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For filter select

// Ensure you have these Shadcn UI components installed:
// npx shadcn-ui@latest add tabs badge table input select

interface ProjectDetailContentProps {
  project: Project;
  initialFindings: Finding[]; // Findings fetched by the server component
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({ project, initialFindings }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Get unique assessment periods for filtering
  const uniquePeriods = Array.from(new Set(initialFindings.map(f => f.assessmentPeriod)));

  // Filtered findings based on search term and selected period
  const filteredFindings = initialFindings.filter(finding => {
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">{project.client} | Status: <Badge variant="outline">{project.status}</Badge></p>

      {/* Action Buttons for the project */}
      <div className="flex gap-2">
        <Button variant="outline">Edit Project</Button>
        <Button>Add New Finding</Button>
        <Button variant="secondary">Generate Report</Button>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4"> {/* Adjusted for 4 tabs */}
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings ({initialFindings.length})</TabsTrigger>
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
              <div className="flex flex-col sm:flex-row gap-4 items-center">
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
                    {/* <SelectItem value="">All Periods</SelectItem> */}
                    {uniquePeriods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => { setSearchTerm(''); setSelectedPeriod(''); }}>Clear Filters</Button>
              </div>

              {filteredFindings.length === 0 ? (
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
                        <TableCell>{finding.affectedEndpoints.join(', ')}</TableCell>
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
