// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ------------------------
// NextAuth configuration
// ------------------------
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // ✅ Cast user pour inclure role et clinicId
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId || "",
        } as {
          id: string;
          email: string;
          role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
          clinicId: string;
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ------------------------
    // JWT callback
    // ------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.clinicId = (user as any).clinicId;
      }
      return token;
    },

    // ------------------------
    // Session callback
    // ------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.clinicId = token.clinicId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
