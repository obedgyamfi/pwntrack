// /app/settings/page.tsx
// This is a Server Component

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Import the shared layout component and the content component
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SettingsContent from '@/components/content/SettingsContent';

export default async function SettingsPage() {
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
    // Wrap SettingsContent with the AuthenticatedLayout
    <AuthenticatedLayout userData={userData}>
      <SettingsContent /> {/* This component will display the settings section */}
    </AuthenticatedLayout>
  );
}
