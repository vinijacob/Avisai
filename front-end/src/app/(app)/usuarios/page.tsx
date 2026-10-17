import type { Metadata } from "next";
import { AdminOnly } from "@/components/admin-only";
import { PageTitle } from "@/components/page-title";
import { UsersTable } from "@/components/users-table";

export const metadata: Metadata = { title: "Usuários" };

export default function UsersPage() {
  return (
    <AdminOnly>
      <PageTitle eyebrow="Administração">
        Quem está no <em>quadro</em>
      </PageTitle>
      <UsersTable />
    </AdminOnly>
  );
}
