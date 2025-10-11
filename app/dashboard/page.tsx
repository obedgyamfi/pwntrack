// /app/dashboard/page.tsx
// This is a Server Component

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Import the new shared layout component
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Import the content component for the dashboard
import DashboardContent from '@/components/content/DashboardContent';


export default async function DashboardPage() {
  const session = await auth();

  // Redirect if no session exists (server-side check)
  if (!session || !session.user) {
    redirect('/login');
  }

  // Pass necessary user data to the client component
  const userData = {
    email: session.user.email,
    name: session.user.name || session.user.email?.split('@')[0], // Fallback for name
  };

  return (
    // Wrap DashboardContent with the AuthenticatedLayout
    <AuthenticatedLayout userData={userData}>
      <DashboardContent />
    </AuthenticatedLayout>
  );
}
