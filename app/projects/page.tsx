// /app/projects/page.tsx
// This is a Server Component

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Import the shared layout component
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Import the content component for displaying the list of projects
import ProjectsContent from '@/components/content/ProjectsContent';

export default async function ProjectsPage() {
  const session = await auth();

  // Redirect if no session exists (server-side check)
  if (!session || !session.user) {
    redirect('/login');
  }

  // Pass necessary user data to the client component for the layout
  const userData = {
    email: session.user.email,
    name: session.user.name || session.user.email?.split('@')[0], // Fallback for name
  };

  return (
    // Wrap ProjectsContent with the AuthenticatedLayout
    <AuthenticatedLayout userData={userData}>
      <ProjectsContent />
    </AuthenticatedLayout>
  );
}
