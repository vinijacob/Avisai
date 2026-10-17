import type { Metadata } from "next";
import { AdminOnly } from "@/components/admin-only";
import { EventForm } from "@/components/event-form";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = { title: "Novo evento" };

export default function NewEventPage() {
  return (
    <AdminOnly>
      <PageTitle eyebrow="Novo evento">
        Publique um <em>aviso</em>
      </PageTitle>
      <EventForm />
    </AdminOnly>
  );
}
