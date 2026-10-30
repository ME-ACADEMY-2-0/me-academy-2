import { AuthForm } from "../AuthForm";

export const metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return <AuthForm mode="reset" />;
}
