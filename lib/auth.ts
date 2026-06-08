// lib/auth.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; 
import { findUserByEmail, findUserByUsername, createUser } from "@/lib/db/mock-users"; 
import bcrypt from "bcryptjs"; 

// ยกไทป์สคริปต์ที่ขยายไว้มาไว้ที่นี่ด้วยครับ
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
  interface User {
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// ประกาศ authOptions สวยๆ อยู่ตรงนี้เป็นส่วนกลาง
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        const user = await findUserByUsername(credentials.username);
        if (!user) throw new Error("Invalid username or password");

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) throw new Error("Invalid username or password");

        return { 
          id: user.id, 
          name: user.username, 
          email: user.email,
          role: user.role || "USER" 
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await findUserByEmail(user.email);
          if (existingUser) return true;

          const baseUsername = user.email.split("@")[0].toLowerCase();
          const usernameExists = await findUserByUsername(baseUsername);
          const finalUsername = usernameExists ? `${baseUsername}_google` : baseUsername;

          await createUser({
            username: finalUsername,
            email: user.email,
            password: crypto.randomUUID(), 
            // @ts-expect-error: Custom role field from database
            role: "USER",
          });
          return true; 
        } catch (error) {
          console.error("[OAUTH CRASH]", error);
          return false; 
        }
      }
      return true; 
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
      } else if (token.email) {
        const dbUser = await findUserByEmail(token.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role || "USER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;   
        session.user.role = token.role as string; 
      }
      return session;
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,
};