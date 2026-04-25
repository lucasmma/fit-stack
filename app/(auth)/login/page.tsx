import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in — fit-stack" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-default-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">fit-stack</h1>
          <p className="mt-1 text-sm text-default-500">Sign in to your account</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
