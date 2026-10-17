"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/types";
import { EventForm } from "./event-form";
import { Skeleton } from "./ui";

export function EditEvent({ id }: { id: number }) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .event(id)
      .then(setEvent)
      .catch((err) => setError((err as Error).message));
  }, [id]);

  if (error) return <p className="text-muted">{error}</p>;
  if (!event) return <Skeleton className="h-96 rounded-[28px]" />;
  return <EventForm event={event} />;
}
