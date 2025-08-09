'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const ReportsContent = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">Generate and manage professional vulnerability reports.</p>
      <Button><FileText className="mr-2 h-4 w-4" /> Generate New Report</Button>
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Access your previously created reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
            (Placeholder for Reports List)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
ReportsContent.icon = FileText;
export default ReportsContent;