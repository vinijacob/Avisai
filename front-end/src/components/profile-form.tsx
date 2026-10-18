"use client";

import { GraduationCap, Lock, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/lib/api";
import { areaLabels, shiftLabels, useCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ageFrom, formatMonthYear, formatPhone, toDateInput } from "@/lib/format";
import type { Area, ProfileInput, Shift, User } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { CourseSelect } from "./course-select";
import { useToast } from "./toast";
import { Avatar, Badge, Button, Field, Input, Select, Skeleton, Textarea } from "./ui";

const ease = [0.2, 0.8, 0.2, 1] as const;
const semesters = Array.from({ length: 12 }, (_, i) => i + 1);
const shifts = Object.entries(shiftLabels) as [Shift, string][];

type FormState = {
  name: string;
  course: string;
  semester: string;
  shift: Shift | null;
  birth_date: string;
  registration: string;
  phone: string;
  bio: string;
};

function initialState(user: User): FormState {
  return {
    name: user.name,
    course: user.course ?? "",
    semester: user.semester ? String(user.semester) : "",
    shift: user.shift,
    birth_date: user.birth_date ?? "",
    registration: user.registration ?? "",
    phone: user.phone ?? "",
    bio: user.bio,
  };
}

function toInput(form: FormState): ProfileInput {
  return {
    name: form.name,
    course: form.course || null,
    semester: form.semester ? Number(form.semester) : null,
    shift: form.shift,
    birth_date: form.birth_date || null,
    registration: form.registration || null,
    phone: form.phone || null,
    bio: form.bio,
  };
}

export function Profile() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <Skeleton className="h-[420px] rounded-[28px]" />
        <Skeleton className="h-[640px] rounded-[28px]" />
      </div>
    );
  }
  return <ProfileForm key={user.id} user={user} />;
}

function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const notify = useToast();
  const catalog = useCatalog();
  const [saved, setSaved] = useState(() => initialState(user));
  const [form, setForm] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limits] = useState(() => {
    const now = new Date();
    const yearsAgo = (years: number) => new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
    return { min: toDateInput(yearsAgo(100)), max: toDateInput(yearsAgo(14)), now };
  });

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const dirty = (Object.keys(form) as (keyof FormState)[]).some((key) => form[key] !== saved[key]);
  const area = catalog?.courses.find((c) => c.name === form.course)?.area ?? null;
  const age = form.birth_date ? ageFrom(form.birth_date, limits.now) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProfile(toInput(form));
      const next = initialState(updated);
      setUser(updated);
      setSaved(next);
      setForm(next);
      notify("Perfil atualizado!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setForm(saved);
    setError(null);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
      >
        <StudentCard user={user} form={form} area={area} age={age} />
        <Completion form={form} />
      </motion.aside>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease }}
        className="flex flex-col gap-6"
      >
        <Section title="Dados pessoais" description="Como você aparece para coordenadores e professores.">
          <Field label="Nome completo">
            <Input
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
            />
          </Field>
          <Field label="E-mail" hint="Não pode ser alterado">
            <Input value={user.email} disabled className="cursor-not-allowed opacity-60" />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Data de nascimento" hint={age !== null ? `${age} anos` : "Opcional"}>
              <Input
                type="date"
                value={form.birth_date}
                onChange={set("birth_date")}
                min={limits.min}
                max={limits.max}
              />
            </Field>
            <Field label="Telefone" hint="Opcional">
              <Input
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                placeholder="(11) 91234-5678"
                autoComplete="tel"
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Vida acadêmica"
          description="Seu curso define quais eventos exclusivos de área você pode participar."
        >
          <Field label="Curso" hint={area ? `Área: ${areaLabels[area]}` : undefined}>
            <CourseSelect value={form.course} onChange={(course) => setForm((f) => ({ ...f, course }))} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Período">
              <Select value={form.semester} onChange={set("semester")}>
                <option value="">Selecione</option>
                {semesters.map((n) => (
                  <option key={n} value={n}>
                    {n}º período
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Matrícula" hint="Opcional">
              <Input
                value={form.registration}
                onChange={set("registration")}
                placeholder="Ex.: 2024001234"
                maxLength={20}
              />
            </Field>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Turno</span>
            <div className="flex flex-wrap gap-2">
              {shifts.map(([value, label]) => {
                const active = form.shift === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, shift: active ? null : value }))}
                    className={cn(
                      "relative cursor-pointer rounded-full border px-4 py-1.5 text-sm transition",
                      active ? "border-transparent text-accent-ink" : "border-line text-muted hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="shift-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="Sobre você" description="Interesses, projetos, o que você curte na faculdade.">
          <Field label="Bio" hint={`${form.bio.length}/280`}>
            <Textarea
              value={form.bio}
              onChange={set("bio")}
              placeholder="Ex.: Apaixonado por IA, monitor de Algoritmos e sempre no time de vôlei."
              maxLength={280}
              className="min-h-28"
            />
          </Field>
        </Section>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {dirty && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="sticky bottom-6 z-30 flex items-center justify-between gap-3 rounded-full border border-line bg-surface/90 py-2 pr-2 pl-5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)] backdrop-blur-xl"
            >
              <span className="flex items-center gap-2 text-sm text-muted">
                <span className="size-2 animate-pulse rounded-full bg-accent" />
                Alterações não salvas
              </span>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" onClick={discard} disabled={saving}>
                  Descartar
                </Button>
                <Button type="submit" loading={saving}>
                  Salvar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-6">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StudentCard({
  user,
  form,
  area,
  age,
}: {
  user: User;
  form: FormState;
  area: Area | null;
  age: number | null;
}) {
  const facts = [
    { label: "Matrícula", value: form.registration },
    { label: "Período", value: form.semester && `${form.semester}º` },
    { label: "Turno", value: form.shift && shiftLabels[form.shift] },
    { label: "Idade", value: age !== null && `${age} anos` },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-accent/25 blur-3xl" />
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-28 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Carteirinha digital</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] tracking-wide text-muted uppercase">
            {user.role === "admin" ? "Admin" : "Aluno"}
          </span>
        </div>

        <Avatar name={form.name || user.name} className="size-20 text-2xl!" />

        <div className="flex flex-col gap-2">
          <p className="font-serif text-3xl leading-tight text-balance">{form.name || "Seu nome"}</p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <GraduationCap className="size-4 shrink-0" />
            {form.course || "Curso não informado"}
          </p>
          {area && (
            <Badge className="w-fit">
              <Lock className="size-3" />
              Acesso a eventos de {areaLabels[area]}
            </Badge>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-line pt-5">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className={cn("truncate font-mono text-sm", !fact.value && "text-muted/60")}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={String(fact.value)}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="inline-block"
                  >
                    {fact.value || "—"}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          ))}
        </dl>

        <p className="flex items-center gap-2 text-xs text-muted">
          <Sparkles className="size-3.5" />
          No Avisaí desde {formatMonthYear(user.created_at)}
        </p>
      </div>
    </div>
  );
}

function Completion({ form }: { form: FormState }) {
  const fields = [form.course, form.semester, form.shift, form.birth_date, form.registration, form.phone, form.bio];
  const ratio = fields.filter(Boolean).length / fields.length;
  const percent = Math.round(ratio * 100);

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl border border-line bg-surface px-5 py-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{percent === 100 ? "Perfil completo" : "Complete seu perfil"}</span>
        <span className="font-mono text-xs text-muted">{percent}%</span>
      </div>
      <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.span
          className="block h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </span>
    </div>
  );
}
