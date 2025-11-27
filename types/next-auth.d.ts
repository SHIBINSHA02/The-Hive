// types/next-auth.d.ts
// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        id: string;
    }

    interface Session {
        user: User & {
            id: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}