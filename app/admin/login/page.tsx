import { AdminLoginPage } from "@/components/admin-login-page";

export const dynamic = "force-dynamic";
export default async function AdminLoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return <AdminLoginPage nextPath={params.next ?? "/admin"} />;
}
