// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const {
  auth,      // for middleware / server-side auth
  signIn,    // for login actions
  signOut,   // for logout actions
  handlers,  // for /api/auth route
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 🔴 TEMP: hard-coded test user
        if (
          credentials?.email === "test@example.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "1",
            name: "Test User",
            email: "test@example.com",
          };
        }

        // If null is returned, user is not authenticated
        return null;
      },
    }),
  ],
});
