"use client";

import { Clock, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { dateParts, formatTimeRange, isHappeningNow, relativeDay } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { RsvpControl } from "./rsvp-control";
import { Badge } from "./ui";

export function EventCard({
  event,
  index,
  onChange,
}: {
  event: EventItem;
  index: number;
  onChange: (event: EventItem) => void;
}) {
  const { day, month, weekday } = dateParts(event.starts_at);
  const live = isHappeningNow(event.starts_at, event.ends_at);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: Math.min(index, 8) * 0.05 }}
      className="group relative"
    >
      <div
        className={cn(
          "relative flex h-full gap-5 rounded-[28px] border border-line bg-surface p-5 transition-all duration-300",
          "hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.35)]",
          event.my_status === "going" && "ring-2 ring-accent/70",
        )}
      >
        <Link href={`/eventos/${event.id}`} aria-label={event.title} className="absolute inset-0 rounded-[28px]" />
        <div className="flex w-14 shrink-0 flex-col items-center pt-1">
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">{month}</span>
          <span className="font-serif text-5xl leading-none">{day}</span>
          <span className="mt-1 text-[11px] text-muted capitalize">{weekday.slice(0, 3)}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {live ? (
              <Badge className="border-transparent bg-accent text-accent-ink">
                <span className="size-1.5 animate-pulse rounded-full bg-accent-ink" />
                Acontecendo agora
              </Badge>
            ) : (
              <span className="text-xs font-medium text-accent-text first-letter:uppercase">
                {relativeDay(event.starts_at)}
              </span>
            )}
            {event.category && <Badge>{event.category}</Badge>}
          </div>

          <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">{event.title}</h3>

          <div className="flex flex-col gap-1.5 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Clock className="size-3.5" />
              {formatTimeRange(event.starts_at, event.ends_at)}
            </span>
            {event.location && (
              <span className="flex items-center gap-2 truncate">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
            <GoingCount event={event} />
            <div className="relative">
              <RsvpControl event={event} onChange={onChange} />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function GoingCount({ event }: { event: EventItem }) {
  const ratio = event.capacity ? Math.min(event.going_count / event.capacity, 1) : null;
  return (
    <div className="flex min-w-24 flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <Users className="size-3.5" />
        <motion.span key={event.going_count} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {event.going_count}
        </motion.span>
        {event.capacity ? `de ${event.capacity} vagas` : event.going_count === 1 ? "confirmado" : "confirmados"}
      </span>
      {ratio !== null && (
        <span className="h-1 w-24 overflow-hidden rounded-full bg-surface-2">
          <motion.span
            className={cn("block h-full rounded-full", ratio >= 1 ? "bg-danger" : "bg-ink")}
            initial={false}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </span>
      )}
    </div>
  );
}
