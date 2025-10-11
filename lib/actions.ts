'use server'; // Marks all exports in this file as Server Actions

import { signOut } from '@/lib/auth'; // Assuming '@/lib/auth' provides the signOut function

export async function handleLogout() {
  await signOut({ redirect: true, redirectTo: '/login' }); // Use redirectTo instead of callbackUrl for signOut
}
