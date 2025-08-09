import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
    pages: {
        signIn: '/login',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
                password: { label: 'Password', type: 'password'},
            },
            authorize: async (credentials) => {
                // i'll connect the database here later
                // for now, i use dummy check
                const email: string = credentials?.email as string;
                const password: string = credentials?.password as string;
                if (email == 'user@example.com' && password == 'password123') {
                    return {
                        id: '1',
                        email: 'user@example.com',
                        name: 'PwnTrack User',
                    };
                }
                // return null if user is not found or password is incorrect 
                return null;
            },
        }),
    ],

    // callbacks for other functionality
    // callbacks: {
    //     async jwt({ token, user }) {
    //         if(user) {
    //             token.id = user.id;
    //         }
    //         return token;
    //     }, 

    //     async session({ session, token }) {
    //         if(session.user) {
    //             session.user.id = token.id as string;
    //         }
    //         return session;
    //     },
    // },

    // session: {
    //     strategy: 'jwt',
    // },
});

export { handlers as GET, handlers as POST };