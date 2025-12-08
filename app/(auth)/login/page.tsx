// app/(auth)/login/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { signIn, SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthNavbar from "@/components/AuthNavbar";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") || "").toString().trim().toLowerCase();
    const password = (fd.get("password") || "").toString();

    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    // Properly typed result from signIn
    const res = (await signIn("credentials", {
      redirect: false,
      email,
      password,
    })) as SignInResponse | undefined;

    setLoading(false);

    if (res && res.error) {
      setError(res.error);
      return;
    }

    // success – go to dashboard or home
    router.push("/dashboard"); // or "/"
  }

  return (
    <main>
      <div>
        <AuthNavbar />
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4"
          >
            <h1 className="text-2xl font-semibold text-center">Welcome back</h1>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium block mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium block mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="text-xs text-center text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
