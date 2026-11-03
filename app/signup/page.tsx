import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/app/auth-form";

export const metadata = { title: "Sign up · K-Study" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUp} />;
}
