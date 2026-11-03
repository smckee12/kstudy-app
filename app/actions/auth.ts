"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; email?: string };

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readForm(formData);

  if (!email || !password) {
    return { error: "Please enter your email and a password.", email };
  }
  if (password.length < 6) {
    return { error: "Your password needs at least 6 characters.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: friendlyError(error.message), email };
  }
  // With "Confirm email" on, Supabase doesn't return an error for an email
  // that's already registered. Instead it returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "There's already an account with that email. Try logging in instead.",
      email,
    };
  }
  // With "Confirm email" turned on in Supabase, there's no session until
  // the user clicks the link in their inbox.
  if (!data.session) {
    return {
      message: "Almost done! Check your email for a link to confirm your account.",
      email,
    };
  }
  redirect("/");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readForm(formData);

  if (!email || !password) {
    return { error: "Please enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: friendlyError(error.message), email };
  }
  redirect("/");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return "That email and password don't match. Please try again.";
  }
  if (/already registered/i.test(message)) {
    return "There's already an account with that email. Try logging in instead.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox for the link.";
  }
  return message;
}
