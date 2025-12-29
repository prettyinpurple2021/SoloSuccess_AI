import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, getDb } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Use getDb() to bypass the Proxy issues, fallback to mock/null for build time
  adapter: (() => {
    try {
      const adapter = DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      });
      console.log("NextAuth DrizzleAdapter initialized successfully.");
      return adapter;
    } catch (e) {
      // During build time or if DB is not available, return a partial/mock adapter
      // This prevents the "Unsupported database type" error from crashing the build
      console.error("CRITICAL: Failed to initialize NextAuth adapter:", e);
      return undefined;
    }
  })(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] Authorize attempt for email:", credentials?.email);
        try {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(8) })
            .safeParse(credentials)

          if (!parsedCredentials.success) {
            console.warn("[Auth] Credential validation failed:", parsedCredentials.error.format());
            return null;
          }

          const { email, password } = parsedCredentials.data
          console.log("[Auth] Querying user from database...");
          
          const userResult = await db.select().from(users).where(eq(users.email, email))
          const user = userResult[0]
          
          if (!user) {
            console.log("[Auth] User not found:", email);
            return null
          }
          
          console.log("[Auth] User found, comparing passwords...");
          // @ts-ignore
          const passwordsMatch = await bcrypt.compare(password, user.password || "")
          
          if (passwordsMatch) {
            console.log("[Auth] Authentication successful for:", email);
            // Return user object without password for security
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }

          console.log("[Auth] Password mismatch for:", email);
        } catch (error) {
          console.error("[Auth] CRITICAL ERROR in authorize callback:", error);
          // Return null instead of letting it bubble up to potentially cause a 500
          return null;
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
})
