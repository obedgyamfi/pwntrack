'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button'; // Needed for PopoverTrigger asChild
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Finding } from '@/lib/dummy-data';

// Define props for the reusable finding form content
interface FindingFormContentProps {
  formData: Omit<Finding, 'id' | 'reportedDate'>;
  reportedDate: Date | undefined;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (id: keyof Omit<Finding, 'id' | 'reportedDate'>, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  availableProjects: { id: string; name: string }[]; // For project dropdown
  isProjectFieldDisabled?: boolean; // To disable project selection if editing from project detail page
}

const FindingFormContent: React.FC<FindingFormContentProps> = ({
  formData,
  reportedDate,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  availableProjects,
  isProjectFieldDisabled = false, // Default to false
}) => {
  return (
    <div className="grid gap-4 py-4">
      {/* Associated Project */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="projectId" className="text-right">
          Project
        </Label>
        {isProjectFieldDisabled ? (
          <Input
            id="projectId"
            value={availableProjects.find(p => p.id === formData.projectId)?.name || 'N/A'}
            className="col-span-3 bg-muted"
            readOnly
          />
        ) : (
          <Select onValueChange={(value) => handleSelectChange('projectId', value)} value={formData.projectId}>
            <SelectTrigger id="projectId" className="col-span-3">
              <SelectValue placeholder="Select associated project" />
            </SelectTrigger>
            <SelectContent>
              {availableProjects.length === 0 ? (
                <SelectItem value="." disabled>No projects available</SelectItem>
              ) : (
                <>
                  <SelectItem value=".">Select a project...</SelectItem>
                  {availableProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Title */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g., SQL Injection in Login"
        />
      </div>

      {/* Severity */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="severity" className="text-right">
          Severity
        </Label>
        <Select onValueChange={(value) => handleSelectChange('severity', value)} value={formData.severity}>
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
        <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
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
          value={formData.affectedEndpoints.join(', ')}
          onChange={handleInputChange}
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
          value={formData.description}
          onChange={handleInputChange}
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
              className={`col-span-3 w-full justify-start text-left font-normal ${!reportedDate && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {reportedDate ? format(reportedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={reportedDate}
              onSelect={handleDateChange}
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
          value={formData.assessmentPeriod}
          onChange={handleInputChange}
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
          value={formData.notes}
          onChange={handleInputChange}
          className="col-span-3 min-h-[60px]"
          placeholder="Any private notes, research links, or internal comments about this finding."
        />
      </div>
    </div>
  );
};

export default FindingFormContent;
