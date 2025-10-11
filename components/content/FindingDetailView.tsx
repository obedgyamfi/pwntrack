'use client';

import React from 'react';
import { Finding } from '@/lib/dummy-data'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; 
import { Separator } from '@/components/ui/separator'; 
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { format } from 'date-fns';


interface FindingDetailViewProps {
  finding: Finding;
  projectName?: string; // Optional: To display associated project name
}

const FindingDetailView: React.FC<FindingDetailViewProps> = ({ finding, projectName }) => {
  // Helper function for styling severity badges (can be global utility)
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
    <ScrollArea className="max-h-[70vh] px-4 py-2"> {/* Added ScrollArea for long content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {finding.title}
          <Badge className={getSeverityBadgeClass(finding.severity)}>{finding.severity}</Badge>
        </h2>
        <p className="text-sm text-muted-foreground">
          Status: <Badge variant="outline">{finding.status}</Badge>
          {projectName && <span className="ml-4">Project: {projectName}</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          Reported: {format(finding.reportedDate, 'PPP')} | Period: {finding.assessmentPeriod}
        </p>

        <Separator />

        <div>
          <h3 className="font-semibold text-lg mb-1">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{finding.description || 'No description provided.'}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">Affected Endpoints/Systems</h3>
          {finding.affectedEndpoints && finding.affectedEndpoints.length > 0 ? (
            <ul className="list-disc list-inside text-muted-foreground">
              {finding.affectedEndpoints.map((endpoint, index) => (
                <li key={index}>{endpoint}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No affected endpoints specified.</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">Notes</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{finding.notes || 'No notes available.'}</p>
        </div>

        {/* You can add more sections here like Proof of Concept, Steps to Reproduce etc. */}
      </div>
    </ScrollArea>
  );
};

export default FindingDetailView;
