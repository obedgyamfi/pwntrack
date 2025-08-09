"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json()

            if (response.ok && data.success) {
                router.push('/dashboard'); // redirect to a protected dashboard page
            } else {
                setError(data.message || 'Login failed');
            }
        } catch(err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Client-side login error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md rounded-lg shadow-lg">
                <CardHeader className="space-y-1 p-6">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Enter your email below to log in to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Eamil</Label>
                            <Input 
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-md"
                                />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-md"
                                />
                        </div>
                        {/* error   goes here */}
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full rounded-md" disabled={loading}>
                            {loading ? 'Logging in...': 'Login'}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/signup')}
                                className="font-medium text-blue-600 hover:underline"
                            >   
                                Sign up
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}