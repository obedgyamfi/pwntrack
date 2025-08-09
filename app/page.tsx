import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RootPage() {
  const cookieStore =  await cookies();
  const sessionToken = cookieStore.get('sessionToken');
  
  if (sessionToken) { // security issue here: validate sessionToken 
    redirect('/dashboard');
  }

  // redirect if no session token
  // redirect('/login')
  redirect('/dashboard')

  // Fallback

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 p-4'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>Welcome</h1>
        <p className='text-lg text-gray-600 mb-6'>You are being redirected...</p>
        <div className='space-x-4'>
          <Button asChild>
            <Link href='/login'>Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href='/signup'>Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
  
}