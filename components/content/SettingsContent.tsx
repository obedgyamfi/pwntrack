'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const SettingsContent = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Configure your PwnTrack preferences and account.</p>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage user profile, notifications, and application preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground h-48 flex items-center justify-center border rounded-md">
            (Placeholder for various settings options)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
SettingsContent.icon = Settings;
export default SettingsContent;