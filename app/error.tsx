// app/error.tsx
"use client"

// 1. Must be 'export default'
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2>Not working bro</h2>
            <p className="text-red-500">{error.message}</p>

            {/* 2. It is good practice to add a reset button */}
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try again
            </button>
        </div>
    )
}