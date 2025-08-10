// /lib/dummy-data.ts

// --- Interfaces (Data Models) ---

export interface Project {
  id: string; // Unique ID for each project
  name: string;
  scope: string;
  methodology: string;
  client: string;
  startDate?: Date;
  endDate?: Date;
  status: 'Planning' | 'Active' | 'Review' | 'Completed' | 'Archived';
}

export interface Finding {
  id: string;
  projectId: string; // Link to the project
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  status: 'New' | 'Triaged' | 'Reported' | 'Fixed' | 'Pending Fix' | 'Closed';
  affectedEndpoints: string[];
  description: string;
  reportedDate: Date;
  assessmentPeriod: string; // e.g., "Q1 2025 Assessment" or "May 2025"
  notes: string; // Add notes field for findings
}

export interface Report {
  id: string;
  projectId?: string; // Optional: Link to a specific project if report is project-specific
  title: string;
  type: 'Executive Summary' | 'Technical Report' | 'Remediation Plan' | 'Other';
  generatedDate: Date;
  // In a real app, this would be a URL or reference to the actual report file
  // For now, it can be a description or a mock download link
  contentSummary: string;
}

// --- In-Memory Data Stores ---
// Using '_' prefix to denote these are internal, mutable arrays
const _projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Acme Corp Web Application',
    scope: 'Public-facing web application at acme.com. Focus on authentication, user management, and payment processing.',
    methodology: 'Grey-box',
    client: 'Acme Corp',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-28'),
    status: 'Completed',
  },
  {
    id: 'proj-2',
    name: 'Internal HR System Audit',
    scope: 'Internal web application for HR data management. All features in scope.',
    methodology: 'White-box',
    client: 'Internal IT',
    startDate: new Date('2025-03-01'),
    endDate: undefined, // Example of undefined end date for active project
    status: 'Active',
  },
  {
    id: 'proj-3',
    name: 'Mobile App V2 Assessment',
    scope: 'iOS and Android mobile applications (versions 2.0.0 and above). APIs at api.acme.com/v2 included.',
    methodology: 'Black-box',
    client: 'Acme Corp',
    startDate: new Date('2025-04-10'),
    endDate: undefined,
    status: 'Planning',
  },
];

const _findings: Finding[] = [
  {
    id: 'find-101',
    projectId: 'proj-1',
    title: 'SQL Injection in Login Form',
    severity: 'Critical',
    status: 'Fixed',
    affectedEndpoints: ['/api/auth/login'],
    description: 'A classic SQL injection vulnerability was found in the username parameter of the login form, allowing unauthenticated access to the database.',
    reportedDate: new Date('2025-02-10'),
    assessmentPeriod: 'Q1 2025 Assessment',
    notes: 'Initial POC was trivial, fix confirmed via re-testing.',
  },
  {
    id: 'find-102',
    projectId: 'proj-1',
    title: 'Cross-Site Scripting (XSS) in User Profile',
    severity: 'High',
    status: 'Pending Fix',
    affectedEndpoints: ['/profile/{id}', '/dashboard'],
    description: 'Reflected XSS discovered in the user profile editing feature. Malicious scripts could be injected via the "bio" field.',
    reportedDate: new Date('2025-02-15'),
    assessmentPeriod: 'Q1 2025 Assessment',
    notes: 'Requires input sanitization and output encoding. Blocked by WAF, but still exploitable if WAF bypassed.',
  },
  {
    id: 'find-103',
    projectId: 'proj-1',
    title: 'Missing Security Headers',
    severity: 'Low',
    status: 'Closed',
    affectedEndpoints: ['/'],
    description: 'The application is missing several recommended security headers (e.g., X-Content-Type-Options, Strict-Transport-Security).',
    reportedDate: new Date('2025-02-20'),
    assessmentPeriod: 'Q1 2025 Assessment',
    notes: 'Recommended adding CSP, HSTS, X-Content-Type-Options headers.',
  },
  {
    id: 'find-201',
    projectId: 'proj-2',
    title: 'Insecure Direct Object Reference (IDOR)',
    severity: 'High',
    status: 'Reported',
    affectedEndpoints: ['/api/users/{id}', '/api/documents/{docId}'],
    description: 'An IDOR vulnerability allows an authenticated user to view or modify other users\' HR records by manipulating predictable IDs in API requests.',
    reportedDate: new Date('2025-03-10'),
    assessmentPeriod: 'Q1 2025 Audit',
    notes: 'Impact: Data exposure of employee records. Critical due to sensitive nature of HR data.',
  },
  {
    id: 'find-202',
    projectId: 'proj-2',
    title: 'Weak Password Policy',
    severity: 'Medium',
    status: 'New',
    affectedEndpoints: ['/admin/settings'],
    description: 'The system allows users to set weak passwords (e.g., "password123") with no complexity requirements.',
    reportedDate: new Date('2025-03-15'),
    assessmentPeriod: 'Q1 2025 Audit',
    notes: 'Recommend enforcing minimum length, special characters, and preventing common patterns.',
  },
];

const _reports: Report[] = [
  {
    id: 'report-001',
    projectId: 'proj-1',
    title: 'Acme Corp Web Application - Final Report Q1 2025',
    type: 'Technical Report',
    generatedDate: new Date('2025-03-05'),
    contentSummary: 'Detailed technical report outlining all findings for Acme Corp Web App. Includes PoCs and remediation steps.',
  },
  {
    id: 'report-002',
    projectId: undefined, // Example of a non-project specific report (e.g., general security audit summary)
    title: 'Annual Security Review 2024 Summary',
    type: 'Executive Summary',
    generatedDate: new Date('2025-01-10'),
    contentSummary: 'High-level overview of security posture for 2024 across all internal systems.',
  },
];

// --- Fake API Functions (Simulating Database Operations) ---

// Simulate a network delay
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Project operations
export async function getProjects(): Promise<Project[]> {
  await simulateDelay();
  return [..._projects]; // Return a copy to prevent direct mutation from outside
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  await simulateDelay();
  return _projects.find(p => p.id === id);
}

export async function addProject(newProjectData: Omit<Project, 'id'>): Promise<Project> {
  await simulateDelay();
  const newProject: Project = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // More robust unique ID
    ...newProjectData,
  };
  _projects.push(newProject);
  return newProject;
}

// Finding operations
export async function getFindings(): Promise<Finding[]> {
  await simulateDelay();
  return [..._findings];
}

export async function getFindingsByProjectId(projectId: string): Promise<Finding[]> {
  await simulateDelay();
  return _findings.filter(f => f.projectId === projectId);
}

export async function getFindingById(id: string): Promise<Finding | undefined> {
  await simulateDelay();
  return _findings.find(f => f.id === id);
}

export async function addFinding(newFindingData: Omit<Finding, 'id'>): Promise<Finding> {
  await simulateDelay();
  const newFinding: Finding = {
    id: `find-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...newFindingData,
  };
  _findings.push(newFinding);
  return newFinding;
}

// Report operations
export async function getReports(): Promise<Report[]> {
  await simulateDelay();
  return [..._reports];
}

export async function getReportById(id: string): Promise<Report | undefined> {
  await simulateDelay();
  return _reports.find(r => r.id === id);
}

export async function addReport(newReportData: Omit<Report, 'id'>): Promise<Report> {
  await simulateDelay();
  const newReport: Report = {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...newReportData,
  };
  _reports.push(newReport);
  return newReport;
}

// --- Dashboard Specific Fetching (can combine existing if needed) ---
export async function getDashboardStats() {
  await simulateDelay();
  const totalProjects = _projects.length;
  const totalFindings = _findings.length;
  const reportedFindings = _findings.filter(f => f.status === 'Reported').length;
  const fixedFindings = _findings.filter(f => f.status === 'Fixed').length;
  const pendingFixes = _findings.filter(f => f.status === 'Pending Fix').length;
  const completedProjects = _projects.filter(p => p.status === 'Completed').length;

  return {
    totalProjects,
    totalFindings,
    reportedFindings,
    fixedFindings,
    pendingFixes,
    completedProjects,
    // Add more stats as needed for charts
  };
}
