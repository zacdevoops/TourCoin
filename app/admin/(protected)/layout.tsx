import { AccessError } from "@/components/admin/access-error";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await requireAdminPage();
  if (access.status !== "authorized") {
    return <AccessError message={access.message} />;
  }

  return <AdminShell email={access.user.email ?? "Administrateur"}>{children}</AdminShell>;
}
