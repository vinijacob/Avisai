import type { Metadata } from "next";
import { EventsBoard } from "@/components/events-board";

export const metadata: Metadata = { title: "Eventos" };

export default function EventsPage() {
  return <EventsBoard />;
}
