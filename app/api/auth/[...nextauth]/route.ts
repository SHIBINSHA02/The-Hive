// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/db";
import UserModel from "@/db/models/User";

// Removed the explicit type annotation (AuthOptions) to resolve the module export error.
// The options object is now implicitly typed by the NextAuth() call below.
const options = {
    session: { strategy: "jwt" as const },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                const email =
                    typeof credentials?.email === "string"
                        ? credentials.email.trim().toLowerCase()
                        : null;
                const password =
                    typeof credentials?.password === "string" ? credentials.password : null;

                if (!email || !password) return null;

                await connectDB();

                const user = await UserModel.findOne({ email }).select("+password").lean();
                if (!user || !user.password) return null;

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) return null;

                return {
                    id: String(user._id),
                    name: user.name ?? null,
                    email: user.email ?? null,
                };
            },
        }),
    ],

    callbacks: {
        // Explicitly typed parameters to prevent "implicit any" errors
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        // Explicitly typed parameters
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                // We cast session.user to a type that includes 'id'
                (session.user as DefaultSession["user"] & { id: string }).id =
                    (token.id as string) || (token.sub as string);
            }
            return session;
        },
    },
};
export const { handlers: { GET, POST } } = NextAuth(options);
