"use client";

import { Globe, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { areaLabels } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { fromLocalInput, toLocalInput } from "@/lib/format";
import type { Area, EventInput, EventItem } from "@/lib/types";
import { EventCard } from "./event-card";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast";
import { Button, Field, Input, Textarea } from "./ui";

const categories = ["Palestra", "Workshop", "Prova", "Reunião", "Cultural", "Esportes", "Aviso"];

const audiences: { value: Area | null; label: string }[] = [
  { value: null, label: "Geral" },
  ...(Object.entries(areaLabels) as [Area, string][]).map(([value, label]) => ({ value, label })),
];

type FormState = {
  title: string;
  description: string;
  location: string;
  category: string;
  area: Area | null;
  starts_at: string;
  ends_at: string;
  capacity: string;
};

function initialState(event?: EventItem): FormState {
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    category: event?.category ?? "",
    area: event?.area ?? null,
    starts_at: toLocalInput(event?.starts_at ?? null),
    ends_at: toLocalInput(event?.ends_at ?? null),
    capacity: event?.capacity ? String(event.capacity) : "",
  };
}

export function EventForm({ event }: { event?: EventItem }) {
  const router = useRouter();
  const notify = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(() => initialState(event));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomorrow] = useState(() => new Date(Date.now() + 86_400_000).toISOString());

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function toInput(): EventInput | null {
    const starts = fromLocalInput(form.starts_at);
    if (!starts) return null;
    return {
      title: form.title,
      description: form.description,
      location: form.location || null,
      category: form.category || null,
      area: form.area,
      starts_at: starts,
      ends_at: fromLocalInput(form.ends_at),
      capacity: form.capacity ? Number(form.capacity) : null,
    };
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const data = toInput();
    if (!data) return setError("Informe a data de início.");
    setSaving(true);
    setError(null);
    try {
      const saved = event ? await api.updateEvent(event.id, data) : await api.createEvent(data);
      notify(event ? "Evento atualizado!" : "Evento publicado!");
      router.push(`/eventos/${saved.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const previewStart = fromLocalInput(form.starts_at) ?? tomorrow;
  const preview: EventItem = {
    id: event?.id ?? 0,
    title: form.title || "Título do evento",
    description: form.description,
    location: form.location || null,
    category: form.category || null,
    area: form.area,
    starts_at: previewStart,
    ends_at: fromLocalInput(form.ends_at),
    capacity: form.capacity ? Number(form.capacity) : null,
    author: { id: user?.id ?? 0, name: user?.name ?? "" },
    created_at: tomorrow,
    going_count: event?.going_count ?? 0,
    my_status: null,
    can_attend: true,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="flex flex-col gap-6">
        <Field label="Título">
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="Ex.: Semana de Tecnologia"
            required
            minLength={3}
            maxLength={120}
            autoFocus
          />
        </Field>

        <Field label="Categoria" hint="Opcional">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = form.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: active ? "" : category }))}
                  className={`relative cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition ${
                    active ? "border-transparent text-accent-ink" : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative">{category}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="Público"
          hint={form.area ? `Só alunos de ${areaLabels[form.area]} podem confirmar` : "Aberto a todos os cursos"}
        >
          <div className="flex flex-wrap gap-2">
            {audiences.map((audience) => {
              const active = form.area === audience.value;
              const Icon = audience.value ? Lock : Globe;
              return (
                <button
                  key={audience.value ?? "general"}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, area: audience.value }))}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition",
                    active ? "border-transparent text-bg" : "border-line text-muted hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="audience-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="relative size-3.5" />
                  <span className="relative">{audience.label}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Início">
            <Input type="datetime-local" value={form.starts_at} onChange={set("starts_at")} required />
          </Field>
          <Field label="Término" hint="Opcional">
            <Input type="datetime-local" value={form.ends_at} onChange={set("ends_at")} min={form.starts_at} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
          <Field label="Local" hint="Opcional">
            <Input value={form.location} onChange={set("location")} placeholder="Ex.: Auditório A" maxLength={120} />
          </Field>
          <Field label="Vagas" hint="Opcional">
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={set("capacity")}
              placeholder="Ilimitado"
            />
          </Field>
        </div>

        <Field label="Descrição" hint={`${form.description.length}/5000`}>
          <Textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Conte para os alunos o que vai rolar…"
            maxLength={5000}
          />
        </Field>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </motion.p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="h-12 px-7">
            {event ? "Salvar alterações" : "Publicar evento"}
          </Button>
          <Button type="button" variant="ghost" className="h-12" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>

      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-3">
          <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Pré-visualização</p>
          <div className="pointer-events-none">
            <EventCard event={preview} index={0} onChange={() => {}} />
          </div>
          <p className="text-sm text-muted">É assim que os alunos vão ver o seu evento no quadro.</p>
        </div>
      </aside>
    </div>
  );
}
