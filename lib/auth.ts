// lib/auth.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; 
import { prisma } from "@/lib/prisma"; // 📥 เปลี่ยนมาอิมพอร์ต Prisma แทน Mock JSON
import bcrypt from "bcryptjs"; 

// ขยาย Type ของ NextAuth ให้รู้จักฟิลด์ id และ role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      password: string | null;
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
        
        // 🔍 1. ค้นหา User จากฐานข้อมูลผ่าน Prisma (เช็คจากฟิลด์ name)
        const user = await prisma.user.findFirst({
          where: { name: credentials.username }
        });
        if (!user) throw new Error("Invalid username or password");

        // 🔍 2. แกะรหัสผ่านเทียบด้วย bcryptjs
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) throw new Error("Invalid username or password");

        // ส่งข้อมูลกลับไปให้ระบบสร้าง Session (แมปค่าให้ตรงกับ Schema)
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // 🌐 กรณีล็อกอินด้วย Google Sign-In
      if (account?.provider === "google" && user.email) {
        try {
          // 🔍 1. เช็คว่ามี Email นี้ในฐานข้อมูลหรือยัง
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          if (existingUser) return true;

          // 🔍 2. ถ้ายังไม่มี ให้ตั้งชื่อ Username จากคำหน้า Email
          const baseUsername = user.email.split("@")[0].toLowerCase();
          const usernameExists = await prisma.user.findFirst({
            where: { name: baseUsername }
          });
          const finalUsername = usernameExists ? `${baseUsername}_google` : baseUsername;

          // 📝 3. สมัครสมาชิกอัตโนมัติลง PostgreSQL ผ่าน Prisma
          await prisma.user.create({
            data: {
              name: finalUsername,
              email: user.email,
              password: crypto.randomUUID(), // ใช้รหัสสุ่มฝังไว้ (เพราะล็อกอินผ่าน Google)
              role: "USER",
            },
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
        // 🔍 ดึงสิทธิ์ล่าสุดจากฐานข้อมูลเผื่อมีการเปลี่ยนแปลง
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
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