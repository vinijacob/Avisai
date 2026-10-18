"use client";

import { ArrowLeft, CalendarDays, Clock, Globe, Lock, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { areaLabels } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { dateParts, formatFullDate, formatTimeRange, relativeDay } from "@/lib/format";
import type { AttendanceStatus, Attendee, EventItem } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { AreaBadge, GoingCount } from "./event-card";
import { RsvpControl } from "./rsvp-control";
import { useToast } from "./toast";
import { Avatar, Badge, Button, Skeleton } from "./ui";

const ease = [0.2, 0.8, 0.2, 1] as const;

export function EventDetail({ id }: { id: number }) {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [missing, setMissing] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    api
      .event(id)
      .then(setEvent)
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-serif text-5xl">Ops.</p>
        <p className="text-muted">Esse evento não existe ou foi removido.</p>
        <BackLink />
      </div>
    );
  }

  if (!event) return <DetailSkeleton />;

  const { day, month } = dateParts(event.starts_at);

  return (
    <div className="flex flex-col gap-8">
      <BackLink />

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex min-w-0 flex-col gap-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && <Badge>{event.category}</Badge>}
              <AreaBadge event={event} />
              <span className="text-sm font-medium text-accent-text first-letter:uppercase">
                {relativeDay(event.starts_at)}
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{event.title}</h1>
            <p className="text-sm text-muted">
              Publicado por <span className="text-ink">{event.author.name}</span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info icon={<CalendarDays />} label="Data">
              <span className="first-letter:uppercase">{formatFullDate(event.starts_at)}</span>
            </Info>
            <Info icon={<Clock />} label="Horário">
              {formatTimeRange(event.starts_at, event.ends_at)}
            </Info>
            <Info icon={<MapPin />} label="Local">
              {event.location ?? "A definir"}
            </Info>
            <Info icon={<Users />} label="Vagas">
              {event.capacity ? `${event.capacity} vagas` : "Sem limite"}
            </Info>
            <Info icon={event.area ? <Lock /> : <Globe />} label="Público">
              {event.area ? `Exclusivo · ${areaLabels[event.area]}` : "Geral · todos os cursos"}
            </Info>
          </div>

          {event.description && (
            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Sobre</h2>
              <p className="text-[17px] leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {isAdmin && <AttendeesPanel eventId={event.id} version={`${event.going_count}-${event.my_status}`} />}
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-6">
            <div className="flex items-end gap-3">
              <span className="font-serif text-7xl leading-[0.8]">{day}</span>
              <span className="pb-1 font-mono text-sm tracking-[0.18em] text-muted uppercase">{month}</span>
            </div>
            <div className="flex flex-col gap-3">
              {event.can_attend && <p className="text-sm font-medium">Você vai participar?</p>}
              <RsvpControl event={event} onChange={setEvent} size="lg" />
            </div>
            <GoingCount event={event} />
          </div>

          {isAdmin && <AdminActions event={event} />}
        </motion.aside>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/eventos"
      className="group inline-flex w-fit items-center gap-2 text-sm text-muted transition hover:text-ink"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      Voltar ao quadro
    </Link>
  );
}

function Info({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 rounded-3xl border border-line bg-surface p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-muted [&_svg]:size-[18px]">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="truncate text-[15px] font-medium">{children}</span>
      </div>
    </div>
  );
}

function AdminActions({ event }: { event: EventItem }) {
  const router = useRouter();
  const notify = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await api.deleteEvent(event.id);
      notify("Evento excluído.");
      router.replace("/eventos");
    } catch (error) {
      notify((error as Error).message, "error");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Link
        href={`/eventos/${event.id}/editar`}
        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-medium transition hover:bg-surface-2"
      >
        <Pencil className="size-4" /> Editar
      </Link>
      <Button variant="outline" className="flex-1 hover:text-danger" onClick={() => setConfirming(true)}>
        <Trash2 className="size-4" /> Excluir
      </Button>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => !deleting && setConfirming(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[28px] bg-surface p-6 shadow-2xl"
            >
              <p className="text-lg font-semibold">Excluir evento?</p>
              <p className="mt-2 text-sm text-muted">
                “{event.title}” e todas as presenças marcadas serão removidos. Essa ação não pode ser desfeita.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={remove} loading={deleting}>
                  Excluir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const tabs: { value: AttendanceStatus; label: string }[] = [
  { value: "going", label: "Vão" },
  { value: "not_going", label: "Não vão" },
];

function AttendeesPanel({ eventId, version }: { eventId: number; version: string }) {
  const [attendees, setAttendees] = useState<Attendee[] | null>(null);
  const [tab, setTab] = useState<AttendanceStatus>("going");

  useEffect(() => {
    api
      .attendees(eventId)
      .then(setAttendees)
      .catch(() => setAttendees([]));
  }, [eventId, version]);

  const list = (attendees ?? []).filter((a) => a.status === tab);

  return (
    <section className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Lista de presença</h2>
        <div className="inline-flex rounded-full bg-surface-2 p-1">
          {tabs.map((item) => {
            const count = (attendees ?? []).filter((a) => a.status === item.value).length;
            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={cn(
                  "relative cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  tab === item.value ? "text-ink" : "text-muted",
                )}
              >
                {tab === item.value && (
                  <motion.span layoutId="attendee-tab" className="absolute inset-0 rounded-full bg-surface shadow-sm" />
                )}
                <span className="relative">
                  {item.label} · {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {attendees === null ? (
        <Skeleton className="h-24" />
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Ninguém por aqui ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          <AnimatePresence initial={false}>
            {list.map((attendee, i) => (
              <motion.li
                key={attendee.user.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 py-3"
              >
                <Avatar name={attendee.user.name} className="size-8 text-[10px]" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{attendee.user.name}</span>
                  <span className="truncate text-xs text-muted">
                    {attendee.course ? `${attendee.course} · ${attendee.email}` : attendee.email}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-3/4" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[74px] rounded-3xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    </div>
  );
}
