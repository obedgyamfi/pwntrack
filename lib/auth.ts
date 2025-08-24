import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

// export const authConfig = {
export const { auth, handlers, signIn, signOut } = NextAuth ({
    pages: {
        signIn: '/login',
        // error: '/login', // Error page for sign-in errors
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;

                if (email === 'admin@example.com' && password === 'password') {
                    return {
                        id: '1',
                        email: 'admin@example.com',
                        name: 'Admin',
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt' as const,
    },
});
// } satisfies NextAuthOptions;

// export const { auth, signIn, signOut } = NextAuth(authConfig);