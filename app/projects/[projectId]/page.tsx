// /app/projects/[projectId]/page.tsx
// This is a Server Component

import { getProjectById, getFindingsByProjectId, Project, Finding } from '@/lib/dummy-data';
import ProjectDetailContent from '@/components/content/ProjectDetailContent';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Server-side authentication check
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }
  const userData = {
    email: session.user.email,
    name: session.user.name || session.user.email?.split('@')[0],
  };

  const { projectId } = await params;

  // Fetch project and findings data on the server
  const project = await getProjectById(projectId); // project will be Project | undefined
  const findings: Finding[] = await getFindingsByProjectId(projectId);

  // If project is not found, trigger Next.js 404
  if (!project) {
    notFound(); // This should theoretically stop execution here
  }

  // Defensive measure: Explicitly assert that 'project' is of type 'Project'.
  // This tells TypeScript (and potentially the runtime) that we guarantee 'project'
  // is defined here, even if `notFound()` might not halt execution immediately
  // in this specific environment.
  const confirmedProject: Project = project as Project;


  return (
    <AuthenticatedLayout userData={userData}>
      <ProjectDetailContent initialProject={confirmedProject} initialFindings={findings} />
    </AuthenticatedLayout>
  );
}
