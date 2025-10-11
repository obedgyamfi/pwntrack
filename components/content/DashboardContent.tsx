'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Bug, ClipboardList, Shield, BarChart, Home } from 'lucide-react'; 
import { getDashboardStats, getFindings, getProjects, Project, Finding } from '@/lib/dummy-data'; 
import { format } from 'date-fns';


type DashboardActivityItem = (Finding & { type: 'finding'; date: Date }) | (Project & { type: 'project'; date: Date });

interface DashboardStats {
  totalProjects: number;
  totalFindings: number;
  reportedFindings: number;
  fixedFindings: number;
  pendingFixes: number;
  completedProjects: number;
}

const DashboardContent = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<DashboardActivityItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);

      const allFindings = await getFindings();
      const allProjects = await getProjects();


      const combinedActivity: DashboardActivityItem[] = [
        ...allFindings.map(f => ({ ...f, type: 'finding' as const, date: f.reportedDate })),
        ...allProjects.map(p => ({ ...p, type: 'project' as const, date: p.startDate || p.endDate || new Date() }))
      ].sort((a, b) => b.date.getTime() - a.date.getTime())
       .slice(0, 5); // Get top 5 recent activities

      setRecentActivities(combinedActivity);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading dashboard data...</p>
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

  // Calculate percentages for the status breakdown chart placeholder
  const totalFindingsCount = stats?.totalFindings || 0;
  const reportedPercentage = totalFindingsCount > 0 ? ((stats?.reportedFindings || 0) / totalFindingsCount) * 100 : 0;
  const fixedPercentage = totalFindingsCount > 0 ? ((stats?.fixedFindings || 0) / totalFindingsCount) * 100 : 0;
  // const pendingPercentage = totalFindingsCount > 0 ? ((stats?.pendingFixes || 0) / totalFindingsCount) * 100 : 0;


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
            <div className="text-2xl font-bold">{stats?.totalProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">Currently assessing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFindings ?? 0}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reportedFindings ?? 0}</div>
            <p className="text-xs text-muted-foreground">{reportedPercentage.toFixed(1)}% of findings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed / Pending</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.fixedFindings ?? 0} / {stats?.pendingFixes ?? 0}</div>
            <p className="text-xs text-muted-foreground">{fixedPercentage.toFixed(1)}% fixed</p>
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
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p> (Placeholder for Pie/Donut Chart) </p>
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
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p> (Placeholder for Bar Chart) </p>
              </div>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and new findings.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-muted-foreground flex items-center justify-center border rounded-md h-24">
                No recent activity.
              </div>
            ) : (
              <ul className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0">
                    {/* Using type guard to differentiate between Finding and Project */}
                    {activity.type === 'finding' ? (
                      <span>
                        <span className="font-semibold">New Finding</span>: {activity.title} in "
                        {/* You might need a project name lookup here if project ID is not enough */}
                        {activity.projectId}"
                      </span>
                    ) : (
                      <span>
                        <span className="font-semibold">New Project</span>: {activity.name}
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {activity.date ? format(activity.date, 'MMM d, yyyy HH:mm') : 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

DashboardContent.icon = Home; 

export default DashboardContent;
