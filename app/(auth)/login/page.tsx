// app/(auth)/login/page.tsx

import { signIn } from "@/auth";


export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="w-full max-w-sm  border p-8 text-center shadow-md rounded-4xl bg-gray-100 p-6">
        <h1 className="mb-6 text-2xl font-bold text-black">Welcome Back</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          
          <button
            type="submit"
            className="mt-4 w-full  bg-blue-600 px-4 py-3 font-semibold text-white rounded-xl hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}