// /app/projects/[projectId]/page.tsx
// This is a Server Component

import { getProjectById, getFindingsByProjectId, Project, Finding } from '@/lib/dummy-data';
import ProjectDetailContent from '@/components/content/ProjectDetailContent';
import { notFound, redirect } from 'next/navigation'; // Import redirect
import { auth } from '@/lib/auth'; // Import auth to check session

// Import the new shared layout component
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

  const { projectId } = params;

  // Fetch project and findings data on the server
  const project: Project | undefined = await getProjectById(projectId);
  const findings: Finding[] = await getFindingsByProjectId(projectId);

  if (!project) {
    // If project not found, display a 404 page
    notFound();
  }

  return (
    // Wrap ProjectDetailContent with the AuthenticatedLayout
    <AuthenticatedLayout userData={userData}>
      <ProjectDetailContent project={project} initialFindings={findings} />
    </AuthenticatedLayout>
  );
}
