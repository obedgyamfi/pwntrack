'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Project } from '@/lib/dummy-data'; // Import the Project interface

// Define props for the reusable form content
interface ProjectFormContentProps {
  formData: Omit<Project, 'id'>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (id: string, value: string) => void;
  handleDateChange: (id: string, date: Date | undefined) => void;
}

// Renamed from ProjectFormDialog to ProjectFormContent
const ProjectFormContent: React.FC<ProjectFormContentProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
}) => {
  return (
    <div className="grid gap-4 py-4">
      {/* Project Name */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Project Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g., Acme Corp Web App V1"
        />
      </div>

      {/* Target/Scope Description */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="scope" className="text-right pt-2">
          Scope
        </Label>
        <Textarea
          id="scope"
          value={formData.scope}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="Describe the application/system, key features, and in-scope assets (e.g., 'Public-facing web application at example.com, excluding API. Focus on authentication and payment processing.')"
        />
      </div>

      {/* Methodology */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="methodology" className="text-right">
          Methodology
        </Label>
        <Select onValueChange={(value) => handleSelectChange('methodology', value)} value={formData.methodology}>
          <SelectTrigger id="methodology" className="col-span-3">
            <SelectValue placeholder="Select methodology" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Black-box">Black-box</SelectItem>
            <SelectItem value="Grey-box">Grey-box</SelectItem>
            <SelectItem value="White-box">White-box</SelectItem>
            <SelectItem value="Internal">Internal Assessment</SelectItem>
            <SelectItem value="External">External Assessment</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client/Organization Name */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="client" className="text-right">
          Client / Org
        </Label>
        <Input
          id="client"
          value={formData.client}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g., Acme Corporation"
        />
      </div>

      {/* Start Date */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">
          Start Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`col-span-3 w-full justify-start text-left font-normal ${!formData.startDate && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date) => handleDateChange('startDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endDate" className="text-right">
          End Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`col-span-3 w-full justify-start text-left font-normal ${!formData.endDate && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.endDate}
              onSelect={(date) => handleDateChange('endDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
          <SelectTrigger id="status" className="col-span-3">
            <SelectValue placeholder="Select project status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProjectFormContent;
