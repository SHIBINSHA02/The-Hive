// app/(auth)/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.message || "Something went wrong");
            return;
        }

        // After signup, go to login
        router.push("/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4"
            >
                <h1 className="text-2xl font-semibold text-center">Register</h1>

                {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium">Name</label>
                    <input
                        name="name"
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p className="text-xs text-center text-slate-500">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Login
                    </a>
                </p>
            </form>
        </div>
    );
}
