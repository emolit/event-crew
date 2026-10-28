import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guard";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
