'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Project, Finding, ReportTemplate, getProjects, getFindingsByProjectId, getTemplates } from '../../lib/dummy-data';
import { Folder, FileText, ChevronLeft, Lightbulb, Check } from 'lucide-react';

const ReportGeneratorDialog = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedProjects, fetchedTemplates] = await Promise.all([getProjects(), getTemplates()]);
      setProjects(fetchedProjects);
      setTemplates(fetchedTemplates);
      setLoading(false);
    };

    if (isDialogOpen) {
      setSelectedProject(null);
      setSelectedTemplate(null);
      setReportContent('');
      fetchData();
    }
  }, [isDialogOpen]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleTemplateSelect = async (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setLoading(true);
    const findings = await getFindingsByProjectId(selectedProject!.id);
    const generatedContent = template.content
      .replace('{projectName}', selectedProject!.name)
      .replace('{projectLead}', selectedProject!.lead)
      .replace('{projectStatus}', selectedProject!.status)
      .replace('{findingsSummary}', generateFindingsSummary(findings));
    setReportContent(generatedContent);
    setLoading(false);
  };

  const generateFindingsSummary = (findings: Finding[]) => {
    if (findings.length === 0) {
      return 'No findings were reported for this project.';
    }

    const findingsBySeverity = findings.reduce((acc, f) => {
      const severityKey = f.severity;
      if (!acc[severityKey]) {
        acc[severityKey] = [];
      }
      acc[severityKey].push(f);
      return acc;
    }, {} as Record<string, Finding[]>);

    const orderedSeverities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
    let summary = '';

    orderedSeverities.forEach(severity => {
      const findingsForSeverity = findingsBySeverity[severity];
      if (findingsForSeverity && findingsForSeverity.length > 0) {
        summary += `#### ${severity} Findings\n`;
        findingsForSeverity.forEach(f => {
          summary += `- **${f.title}**\n`;
        });
        summary += '\n';
      }
    });

    return summary;
  };

  const handleGenerateReport = () => {
    console.log("Generating report with AI...");
    console.log("AI Report Generation is a feature for the future! For now, you can manually edit the content.");
    
    // Simulate AI generation by appending a line
    setReportContent(prev => prev + '\n\n---\nAI-generated summary: The key findings highlight critical areas for immediate attention, including SQL injection and XSS vulnerabilities, which should be prioritized for remediation.');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedProject?.name.replace(/\s/g, '_')}_report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center">Loading...</p>;
    }

    if (!selectedProject) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 1: Select a Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card
                key={project.id}
                className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Folder className="mr-2" /> {project.name}
                  </CardTitle>
                  <CardDescription>
                    Status: {project.status}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (selectedProject && !selectedTemplate) {
      return (
        <div className="space-y-4">
          <Button onClick={() => setSelectedProject(null)} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Change Project
          </Button>
          <h3 className="text-lg font-semibold mt-4">Step 2: Select a Template</h3>
          <p className="text-sm text-gray-500">
            This template will be used to structure your report. In a future update, you'll be able to upload your own Word document.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2" /> {template.name}
                  </CardTitle>
                  <CardDescription>
                    {template.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review and Edit Report</h3>
        <p className="text-sm text-gray-500">
          Report generated from '{selectedTemplate?.name}' template.
        </p>
        <textarea
          className="w-full h-80 p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          value={reportContent}
          onChange={e => setReportContent(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4">
          <Button onClick={() => setSelectedTemplate(null)} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Change Template
          </Button>
          <div className="space-x-2">
            <Button onClick={handleGenerateReport} variant="secondary">
              <Lightbulb className="mr-2 h-4 w-4" /> AI Edit
            </Button>
            <Button onClick={handleDownload}>
              Download Report
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Generate New Report
          <FileText className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            Generate a comprehensive security report for your projects.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ReportGeneratorDialog;
