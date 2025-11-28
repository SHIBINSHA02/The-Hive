// app/(auth)/reset-password/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    // initialize error based on token to avoid calling setState inside useEffect
    const [error, setError] = useState<string | null>(
        token ? null : "Invalid reset link."
    );
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setMsg(null);

        const fd = new FormData(e.currentTarget);
        const password = (fd.get("password") || "").toString();
        const confirm = (fd.get("confirm") || "").toString();

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Missing token.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) {
                setError(data.message || "Failed to reset password.");
                return;
            }
            setMsg("Password updated. Redirecting to login...");
            setTimeout(() => router.push("/login"), 1500);
        } catch (err) {
            // use the error variable so linter is happy and you have debug info
            console.error("Reset password failed:", err);
            setError("Network error. Try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4"
            >
                <h1 className="text-2xl font-semibold text-center">Set a new password</h1>

                {msg && <p className="text-sm text-green-600 text-center">{msg}</p>}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div>
                    <label htmlFor="password" className="text-sm font-medium block mb-1">
                        New password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="confirm" className="text-sm font-medium block mb-1">
                        Confirm password
                    </label>
                    <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        required
                        minLength={6}
                        className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                >
                    {loading ? "Updating..." : "Update password"}
                </button>

                <p className="text-xs text-center text-slate-500">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Back to login
                    </Link>
                </p>
            </form>
        </div>
    );
}
