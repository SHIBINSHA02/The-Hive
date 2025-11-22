// app/not-found.tsx

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold">404 - Page not found</h1>
            <p className="text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <a href="/" className="underline">
                Go back home
            </a>
        </div>
    );
}
