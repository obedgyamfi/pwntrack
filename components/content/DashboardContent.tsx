'use client'; 

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Folder, Bug, ClipboardList, Shield, BarChart } from 'lucide-react'; 

const DashboardContent = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <p className="text-muted-foreground">Welcome back to PwnTrack! Here's a quick look at your progress.</p>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">345</div>
            <p className="text-xs text-muted-foreground">+25 new</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180</div>
            <p className="text-xs text-muted-foreground">75% of findings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed / Pending</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120 / 60</div>
            <p className="text-xs text-muted-foreground">35% resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Status</CardTitle>
            <CardDescription>Breakdown of findings by their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-md">
              (Placeholder for Pie/Donut Chart)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Vulnerable Applications</CardTitle>
            <CardDescription>Applications with the most reported vulnerabilities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-md">
              (Placeholder for Bar Chart)
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and new findings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm">
                <span>**New Finding**: SQL Injection in "Auth Service" (Project A)</span>
                <span className="text-muted-foreground text-xs">2 hours ago</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>**Status Update**: XSS in "User Profile" (Project B) - Fixed</span>
                <span className="text-muted-foreground text-xs">Yesterday</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>**New Project**: "Mobile App V2 Assessment"</span>
                <span className="text-muted-foreground text-xs">3 days ago</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

DashboardContent.icon = Home;
export default DashboardContent;
