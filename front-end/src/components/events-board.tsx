"use client";

import { ArrowRight, CalendarX2, GraduationCap, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { EventItem } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { EventCard } from "./event-card";
import { useToast } from "./toast";
import { Skeleton } from "./ui";

type Scope = "upcoming" | "past";

const scopes: { value: Scope; label: string }[] = [
  { value: "upcoming", label: "Próximos" },
  { value: "past", label: "Anteriores" },
];

export function EventsBoard() {
  const { user } = useAuth();
  const notify = useToast();
  const [scope, setScope] = useState<Scope>("upcoming");
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .events(scope)
      .then((data) => active && setEvents(data))
      .catch((error) => {
        if (!active) return;
        setEvents([]);
        notify((error as Error).message, "error");
      });
    return () => {
      active = false;
    };
  }, [scope, notify]);

  const categories = useMemo(
    () => [...new Set((events ?? []).map((e) => e.category).filter((c): c is string => !!c))].sort(),
    [events],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (events ?? []).filter((event) => {
      if (category && event.category !== category) return false;
      if (!term) return true;
      return [event.title, event.description, event.location, event.category]
        .filter(Boolean)
        .some((text) => text!.toLowerCase().includes(term));
    });
  }, [events, query, category]);

  const goingCount = (events ?? []).filter((e) => e.my_status === "going").length;

  function update(updated: EventItem) {
    setEvents((current) => current?.map((e) => (e.id === updated.id ? updated : e)) ?? null);
  }

  function changeScope(next: Scope) {
    if (next === scope) return;
    setEvents(null);
    setCategory(null);
    setScope(next);
  }

  return (
    <div className="flex flex-col gap-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col gap-4"
      >
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          {user ? `Olá, ${user.name.split(" ")[0]}` : "Quadro de avisos"}
        </p>
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          O que está <em className="relative isolate inline-block">
            rolando
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute inset-x-0 bottom-1 -z-10 h-3 origin-left rounded-full bg-accent sm:h-4"
            />
          </em>
        </h1>
        {events && scope === "upcoming" && (
          <p className="text-muted">
            {events.length === 0
              ? "Nenhum evento agendado por enquanto."
              : `${events.length} ${events.length === 1 ? "evento" : "eventos"} pela frente · você vai em ${goingCount}.`}
          </p>
        )}
      </motion.header>

      {user && !user.course && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link
            href="/perfil"
            className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 transition hover:border-ink/20"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-ink">
              <GraduationCap className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">Informe seu curso</span>
              <span className="text-sm text-muted">Assim você libera os eventos exclusivos da sua área.</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
            {scopes.map((item) => (
              <button
                key={item.value}
                onClick={() => changeScope(item.value)}
                className={cn(
                  "relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  scope === item.value ? "text-bg" : "text-muted hover:text-ink",
                )}
              >
                {scope === item.value && (
                  <motion.span
                    layoutId="scope-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>

          <label className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar eventos…"
              className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-accent/40"
            />
          </label>
        </div>

        <AnimatePresence initial={false}>
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              {[null, ...categories].map((item) => (
                <button
                  key={item ?? "all"}
                  onClick={() => setCategory(item)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition",
                    category === item
                      ? "border-transparent bg-accent text-accent-ink"
                      : "border-line text-muted hover:text-ink",
                  )}
                >
                  {item ?? "Todos"}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {events === null ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-[28px]" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          filtered={events.length > 0}
          scope={scope}
          isAdmin={user?.role === "admin"}
        />
      ) : (
        <motion.div layout className="grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} onChange={update} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function EmptyState({ filtered, scope, isAdmin }: { filtered: boolean; scope: Scope; isAdmin: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dot-grid flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-line px-6 py-20 text-center"
    >
      <motion.span
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
        className="flex size-14 items-center justify-center rounded-2xl bg-surface shadow-sm"
      >
        <CalendarX2 className="size-6 text-muted" />
      </motion.span>
      <div>
        <p className="font-medium">
          {filtered ? "Nada encontrado" : scope === "upcoming" ? "O quadro está vazio" : "Nenhum evento passado"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {filtered
            ? "Tente outra busca ou categoria."
            : scope === "upcoming"
              ? "Quando houver novidades, elas aparecem aqui."
              : "Os eventos que já aconteceram ficam guardados aqui."}
        </p>
      </div>
      {isAdmin && !filtered && scope === "upcoming" && (
        <Link
          href="/eventos/novo"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-bg transition active:scale-[0.97]"
        >
          <Plus className="size-4" /> Criar o primeiro evento
        </Link>
      )}
    </motion.div>
  );
}
