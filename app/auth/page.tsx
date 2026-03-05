import { AuthForm } from "./AuthForm";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function AuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = typeof params?.error === "string" ? params.error : null;
  const confirmed = params?.confirmed === "1";
  const passwordUpdated = params?.password_updated === "1";
  return <AuthForm callbackError={error} confirmed={confirmed} passwordUpdated={passwordUpdated} />;
}
