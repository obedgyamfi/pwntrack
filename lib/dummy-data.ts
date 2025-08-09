// /lib/dummy-data.ts

// Define a type for a Project object
export interface Project {
  id: string;
  name: string;
  scope: string;
  methodology: string;
  client: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: string;
}

// Define a type for a Finding object (simplified for now)
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
}

// In-memory array to store projects
const projects: Project[] = [
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
    endDate: undefined,
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

// In-memory array to store findings
const findings: Finding[] = [
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
  },
];

export async function getProjects(): Promise<Project[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return projects.find(p => p.id === id);
}

export async function getFindingsByProjectId(projectId: string): Promise<Finding[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return findings.filter(f => f.projectId === projectId);
}
