import type { NextAuthConfig } from "next-auth"
import { logInfo, logAuth } from "@/lib/logger"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" },
  callbacks: {
    async authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin')
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
      
      // Always allow access to auth pages
      if (isAuthPage) {
        return true
      }
      
      // Protect dashboard/admin routes
      if (isOnDashboard) {
        logAuth('authorization check', auth?.user?.id as string | undefined, isLoggedIn, { 
          path: nextUrl.pathname 
        });
        
        if (isLoggedIn) {
          return true
        }
        
        // If auth.user is not available, deny access
        // NextAuth middleware should populate auth before this callback is called
        // Allowing access based on cookie presence alone is a security risk
        
        logInfo('Redirecting unauthenticated user to login', { 
          source: 'auth.config.authorized',
          path: nextUrl.pathname 
        });
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
        if (user) {
            token.id = user.id
            token.email = user.email || token.email
            token.name = (user as any).full_name || (user as any).name || token.name
            if ('role' in user) token.role = user.role;
            if ('subscription_tier' in user) token.subscription_tier = user.subscription_tier;
        }
        if (trigger === "update" && session) {
            token = { ...token, ...session }
        }
        return token
    },
    async session({ session, token }) {
        if (token) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = (token.email as string) || session.user.email
                session.user.name = (token.name as string) || session.user.name
                // @ts-ignore
                session.user.role = token.role as string
                // @ts-ignore
                session.user.subscription_tier = token.subscription_tier as string
            }
        }
        return session
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
