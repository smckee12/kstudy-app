"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

// The shared form for the log-in and sign-up pages.
export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8">
        <h1 className="text-2xl font-bold text-navy">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isSignup
            ? "Start building your Korean word bank."
            : "Log in to keep studying. 공부합시다!"}
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-normal"
            />
            {isSignup && (
              <span className="text-xs font-normal text-gray-500">
                At least 6 characters
              </span>
            )}
          </label>

          {state.error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-success">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-semibold text-navy underline"
          >
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
