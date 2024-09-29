import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/app/firebase/config";
import { adminDb } from "@/app/firebase/admin";

// Define a custom User type that extends NextAuthUser
interface User extends NextAuthUser {
  id: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !clientAuth) return null;
        try {
          const userCredential = await signInWithEmailAndPassword(clientAuth, credentials.email, credentials.password);
          const user = userCredential.user;
          const userDoc = await adminDb.collection('users').doc(user.uid).get();
          const userData = userDoc.data();
          return {
            id: user.uid,
            email: user.email,
            name: userData?.name || user.displayName,
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as User).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };