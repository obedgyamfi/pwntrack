import { auth, signOut}  from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const userData = {
        email: session.user?.email,
        name: session.user?.name,
    }

    const handleLogout = async () => {
        'use server'
        await signOut({redirect: true, callbackUrl: '/login'});
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
            <Card className="w-full max-w-md rounded-lg shadow-lg p-6">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-gray-800">Welcome to your Dashboard!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg text-gray-700">You are successfully logged in.</p>
                    <p className="text-md text-gray-600">Email: {userData.email}</p>
                    <p className="text-md text-gray-600">Name: {userData.name}</p>
                    <form action={handleLogout}>
                        <Button type="submit" className="mt-4 bg-red-500 hover:bg-red-600 rounded-md">
                            Logout
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )

}