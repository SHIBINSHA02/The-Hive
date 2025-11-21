app/(auth)/login/page.tsx 

import { signIn } from "@/auth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 text-center shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Welcome Back</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button className="w-full" variant="primary">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  );
}