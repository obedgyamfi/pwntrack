// /app/reports/page.tsx
// This is a Server Component

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Import the shared layout component and the content component
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ReportsContent from '@/components/content/ReportsContent';

export default async function ReportsPage() {
  const session = await auth();

  // Redirect if no session exists (server-side check)
  if (!session || !session.user) {
    redirect('/login');
  }

  // Prepare user data to pass to the layout
  const userData = {
    email: session.user.email,
    name: session.user.name || session.user.email?.split('@')[0], // Fallback for name
  };

  return (
    // Wrap ReportsContent with the AuthenticatedLayout
    <AuthenticatedLayout userData={userData}>
      <ReportsContent /> {/* This component will display the reports section */}
    </AuthenticatedLayout>
  );
}
