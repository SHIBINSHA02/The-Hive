// app/(auth)/register/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        const name = (fd.get("name") || "").toString().trim();
        const email = (fd.get("email") || "").toString().trim().toLowerCase();
        const password = (fd.get("password") || "").toString();

        if (!name || !email || password.length < 6) {
            setError("Please fill all fields and ensure password is at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to register");
                setLoading(false);
                return;
            }

            // success -> go to login, optionally show success toast
            router.push("/login");
        } catch (err) {
            setError("Network error. Try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-gray-900">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4"
                aria-busy={loading}
            >
                <h1 className="text-2xl font-semibold text-center">Create account</h1>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div>
                    <label htmlFor="name" className="text-sm font-medium block mb-1">Name</label>
                    <input id="name" name="name" type="text" autoComplete="name"
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your full name" />
                </div>

                <div>
                    <label htmlFor="email" className="text-sm font-medium block mb-1">Email</label>
                    <input id="email" name="email" type="email" required autoComplete="email"
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com" />
                </div>

                <div>
                    <label htmlFor="password" className="text-sm font-medium block mb-1">Password</label>
                    <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password"
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="At least 6 characters" />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70">
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p className="text-xs text-center text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
}
