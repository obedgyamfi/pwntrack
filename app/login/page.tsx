'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Import your Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/dist/client/link';

// Define your validation schema
const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
    const [error, setError] = useState('');

    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: any) => {
        try {
            setError(''); // Reset error state
            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            console.log('result:', result);
            console.log('ok:', result?.ok, 'error:', result?.error);

            if (result && result?.error) {
                setError('Login failed. Invalid Credentials');
                return;
            } else if (result && result?.ok) {
                router.push('/dashboard');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }

        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md rounded-lg shadow-lg">
                <CardHeader className='space-y-1 p-6'>
                    <CardTitle className='text-2xl font-bold text-center'>Login</CardTitle>
                    <CardDescription className='text-center text-gray-600'>Enter your credentials to log in.</CardDescription>
                </CardHeader>
                <CardContent className='p-6 pt-0'>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className='space-y-2'>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                required
                                className='rounded-md'
                                placeholder='you@example.com'
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...form.register('password')}
                                required
                                className='rounded-md'
                            />
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full rounded-md" disabled={form.formState.isSubmitting}>
                            Login
                        </Button>
                        <p className='text-sm text-center'>Don't have an account? <Link href="/signup" className="text-blue-500">Sign up</Link></p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}