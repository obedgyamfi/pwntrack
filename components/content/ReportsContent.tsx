'use client'; // This component uses client-side hooks

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react'; // Added Download icon
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // For reports table
import { getReports, Report, getProjects } from '@/lib/dummy-data'; // Import API functions and types
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ReportFormContent from '@/components/forms/ReportFormDialog';

const ReportsContent = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isReportFormDialogOpen, setReportDialogFormOpen] = useState(false);
  const [projectsMap, setProjectsMap] = useState<Map<string, string>>(new Map()); // Map projectId to projectName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // // Staet for the form data within ReportContent
  //   const [formData, setFormData] = useState<Omit<Project, 'id'>>({
  //   name: '',
  //   scope: '',
  //   methodology: '',
  //   client: '',
  //   startDate: undefined,
  //   endDate: undefined,
  //   status: 'Planning',
  // });

  const fetchReportsAndProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedReports = await getReports();
      setReports(fetchedReports);

      const fetchedProjects = await getProjects();
      const map = new Map<string, string>();
      fetchedProjects.forEach(p => map.set(p.id, p.name));
      setProjectsMap(map);

    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportsAndProjects();
  }, [fetchReportsAndProjects]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading reports...</p>
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
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">Generate and manage professional vulnerability reports.</p>

      {/* <Button><FileText className="mr-2 h-4 w-4" /> Generate New Report</Button> */}

      {/*Button to generate new report */}
      <Dialog open={isReportFormDialogOpen} onOpenChange={setReportDialogFormOpen}>
        <DialogTrigger asChild>
          <Button>
            <FileText className='mr-2 h-4 w-4' /> Generate New Report
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[600px'>
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>Generate a comprehensive security report for your projects.</DialogDescription>
          </DialogHeader>
       `   <ReportFormContent></ReportFormContent>`
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Access your previously created reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
              No reports generated yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.projectId ? projectsMap.get(report.projectId) : 'General'}</TableCell>
                    <TableCell>{format(report.generatedDate, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {report.contentSummary}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" /> View/Download
                      </Button>
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

ReportsContent.icon = FileText; // Ensure the icon is exported

export default ReportsContent;
