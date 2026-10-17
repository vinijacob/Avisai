import { Suspense } from "react";
import { DetailSkeleton, EventDetail } from "@/components/event-detail";

export default function EventPage({ params }: PageProps<"/eventos/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: Pick<PageProps<"/eventos/[id]">, "params">) {
  const { id } = await params;
  return <EventDetail key={id} id={Number(id)} />;
}
