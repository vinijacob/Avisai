"use client";

import { Check, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { areaLabels } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { AttendanceStatus, EventItem } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast";

const options: { status: AttendanceStatus; label: string; icon: typeof Check }[] = [
  { status: "going", label: "Vou", icon: Check },
  { status: "not_going", label: "Não vou", icon: X },
];

export function RsvpControl({
  event,
  onChange,
  size = "md",
}: {
  event: EventItem;
  onChange: (event: EventItem) => void;
  size?: "md" | "lg";
}) {
  const notify = useToast();
  const { user } = useAuth();
  const [pending, setPending] = useState(false);
  const [burst, setBurst] = useState(0);
  const [now] = useState(Date.now);

  const finished = new Date(event.ends_at ?? event.starts_at).getTime() < now;
  const full = event.capacity !== null && event.going_count >= event.capacity && event.my_status !== "going";

  async function choose(status: AttendanceStatus) {
    if (pending) return;
    const clearing = event.my_status === status;
    setPending(true);
    try {
      const updated = clearing ? await api.clearAttendance(event.id) : await api.setAttendance(event.id, status);
      onChange(updated);
      if (!clearing && status === "going") {
        setBurst((b) => b + 1);
        notify("Presença confirmada!");
      }
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setPending(false);
    }
  }

  if (finished) {
    return (
      <p className="text-sm text-muted">
        {event.my_status === "going" ? "Você marcou presença" : "Evento encerrado"}
      </p>
    );
  }

  if (!event.can_attend && event.area) {
    const missingCourse = user !== null && !user.course;
    return (
      <div className={cn("flex flex-col gap-1.5", size === "lg" && "w-full")}>
        <span
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-line font-medium text-muted",
            size === "lg" ? "h-14 w-full text-[15px]" : "h-10 px-4 text-sm",
          )}
        >
          <Lock className="size-4" />
          Só para {areaLabels[event.area]}
        </span>
        {size === "lg" && (
          <p className="text-center text-xs text-muted">
            {missingCourse ? (
              <>
                <Link href="/perfil" className="text-ink underline decoration-accent decoration-2 underline-offset-4">
                  Informe seu curso
                </Link>{" "}
                para participar de eventos da sua área.
              </>
            ) : (
              "Este evento é exclusivo para alunos dessa área."
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full border border-line bg-surface-2",
        size === "lg" ? "flex w-full p-1.5" : "inline-flex p-1",
        pending && "opacity-70",
      )}
    >
      {options.map(({ status, label, icon: Icon }) => {
        const selected = event.my_status === status;
        const disabled = status === "going" && full;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => choose(status)}
            className={cn(
              "relative flex cursor-pointer items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              size === "lg" ? "h-11 flex-1 px-6 text-[15px]" : "h-8 px-3.5 text-sm",
              selected ? (status === "going" ? "text-accent-ink" : "text-bg") : "text-muted hover:text-ink",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`rsvp-${event.id}-${size}`}
                className={cn("absolute inset-0 rounded-full", status === "going" ? "bg-accent" : "bg-ink")}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <Icon className="relative size-4" strokeWidth={2.5} />
            <span className="relative">{disabled ? "Lotado" : label}</span>
            {status === "going" && <Burst key={burst} active={burst > 0} />}
          </button>
        );
      })}
    </div>
  );
}

function Burst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <span className="pointer-events-none absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-accent"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(angle) * 34, y: Math.sin(angle) * 22, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              />
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
}
