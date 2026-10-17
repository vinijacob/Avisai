import { Suspense } from "react";
import { AdminOnly } from "@/components/admin-only";
import { EditEvent } from "@/components/edit-event";
import { PageTitle } from "@/components/page-title";
import { Skeleton } from "@/components/ui";

export default function EditEventPage({ params }: PageProps<"/eventos/[id]/editar">) {
  return (
    <AdminOnly>
      <PageTitle eyebrow="Editar evento">
        Ajuste os <em>detalhes</em>
      </PageTitle>
      <Suspense fallback={<Skeleton className="h-96 rounded-[28px]" />}>
        <Edit params={params} />
      </Suspense>
    </AdminOnly>
  );
}

async function Edit({ params }: Pick<PageProps<"/eventos/[id]/editar">, "params">) {
  const { id } = await params;
  return <EditEvent key={id} id={Number(id)} />;
}
