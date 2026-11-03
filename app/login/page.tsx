import { logIn } from "@/app/actions/auth";
import { AuthForm } from "@/app/auth-form";

export const metadata = { title: "Log in · K-Study" };

export default function LoginPage() {
  return <AuthForm mode="login" action={logIn} />;
}
