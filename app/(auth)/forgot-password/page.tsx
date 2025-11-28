// app/(auth)/forgot-password/page.tsx
// app/(auth)/forgot-password/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setMsg(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        const email = (fd.get("email") || "").toString().trim().toLowerCase();

        if (!email) {
            setError("Please enter your email");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setError(data.message || "Failed to send reset link");
                return;
            }

            setMsg("If that email exists, a reset link was sent. Check your inbox.");
        } catch (err) {
            setError("Network error. Try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold text-center">Reset password</h1>

                {msg && <p className="text-sm text-green-600 text-center">{msg}</p>}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div>
                    <label htmlFor="email" className="text-sm font-medium block mb-1">Email</label>
                    <input id="email" name="email" type="email" required
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70">
                    {loading ? "Sending..." : "Send reset link"}
                </button>

                <p className="text-xs text-center text-slate-500">
                    Remembered? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
}
