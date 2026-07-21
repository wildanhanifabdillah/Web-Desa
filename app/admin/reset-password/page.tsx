import { AdminResetPasswordPage } from "@/components/admin-reset-password-page";

export default async function AdminResetPasswordRoute({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <AdminResetPasswordPage token={params.token ?? ""} />;
}
