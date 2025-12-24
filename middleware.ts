// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export const middleware = clerkMiddleware({
  publicRoutes: ["/", "/api/webhook/clerk"],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
