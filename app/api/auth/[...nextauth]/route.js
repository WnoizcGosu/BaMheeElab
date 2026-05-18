import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; 
import { findUserByEmail, findUserByUsername, createUser } from "@/lib/db/mock-users"; 
import bcrypt from "bcryptjs"; 

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

        return { id: user.id, name: user.username, email: user.email };
      }
    })
  ],

  // ── NEXTAUTH CALLBACK INTERCEPTORS ──
  callbacks: {
    async signIn({ user, account, profile }) {
      // We only want to run this sync logic for Google OAuth users
      if (account.provider === "google") {
        try {
          console.log(`[OAUTH INCOMING] Google login attempt from: ${user.email}`);
          
          // 1. Check if this Google user is already registered in users.json
          const existingUser = await findUserByEmail(user.email);
          
          if (existingUser) {
            console.log(`[OAUTH SUCCESS] Google user found in local JSON storage.`);
            return true; // Let them log in smoothly
          }

          // 2. If not found, generate a clean username handle from their Gmail address
          // e.g., proudnapassara@gmail.com -> proudnapassara
          const baseUsername = user.email.split("@")[0].toLowerCase();
          
          // Make sure the username handle doesn't conflict with an existing manual registration
          const usernameExists = await findUserByUsername(baseUsername);
          const finalUsername = usernameExists 
            ? `${baseUsername}_google` 
            : baseUsername;

          console.log(`[OAUTH AUTO-REGISTER] Creating account wrapper for: ${finalUsername}`);

          // 3. Write them into our mock file database
          await createUser({
            username: finalUsername,
            email: user.email,
            password: crypto.randomUUID(), // OAuth profiles don't need passwords, so we store a random string
          });

          console.log(`[OAUTH REGISTER SUCCESS] New Google account linked to users.json!`);
          return true; // Return true to allow the sign-in process to complete
        } catch (error) {
          console.error("[OAUTH CRASH] Failed to link Google profile with file database:", error);
          return false; // Return false to reject the login if database write fails
        }
      }
      
      return true; // Allow standard credentials users to pass right through
    }
  },

  pages: {
    signIn: "/login",
  },
  
  session: {
    strategy: "jwt", 
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default handler;