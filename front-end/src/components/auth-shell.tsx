"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

const notices = [
  { day: "12", month: "nov", title: "Semana de Tecnologia", tag: "Palestra", going: 128 },
  { day: "03", month: "dez", title: "Prova de Cálculo II", tag: "Prova", going: 64 },
  { day: "18", month: "nov", title: "Workshop de UX Design", tag: "Workshop", going: 42 },
  { day: "21", month: "nov", title: "Sarau da Primavera", tag: "Cultural", going: 87 },
  { day: "28", month: "nov", title: "Reunião do DCE", tag: "Reunião", going: 23 },
  { day: "05", month: "dez", title: "Torneio de Vôlei", tag: "Esportes", going: 56 },
  { day: "09", month: "dez", title: "Feira de Estágios", tag: "Aviso", going: 210 },
  { day: "14", month: "dez", title: "Hackathon Avisaí", tag: "Workshop", going: 95 },
];

function NoticeColumn({ offset, reverse }: { offset: number; reverse?: boolean }) {
  const items = [...notices.slice(offset), ...notices.slice(0, offset)];
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex animate-marquee flex-col gap-4"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...items, ...items].map((notice, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur",
              i % 3 === 0 && "border-[#d4ff3a]/40",
            )}
          >
            <div className="flex w-10 flex-col items-center">
              <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase">{notice.month}</span>
              <span className="font-serif text-3xl leading-none text-white">{notice.day}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                {notice.tag}
              </span>
              <span className="truncate text-sm font-medium text-white">{notice.title}</span>
              <span className="text-[11px] text-white/50">{notice.going} confirmados</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b0b0d] p-12 lg:flex lg:flex-col">
        <div className="dot-grid absolute inset-0 opacity-60 [--dot:rgb(255_255_255/0.08)]" />
        <div className="relative z-10 text-white">
          <Logo />
        </div>

        <div className="absolute inset-y-0 right-0 grid w-[62%] rotate-[-8deg] grid-cols-2 gap-4 opacity-90 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <NoticeColumn offset={0} />
          <NoticeColumn offset={4} reverse />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 mt-auto max-w-sm"
        >
          <h2 className="font-serif text-6xl leading-[0.95] text-white">
            Nenhum aviso <em className="text-[#d4ff3a]">perdido</em>.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            Eventos, provas e avisos da faculdade em um só lugar. Confirme presença com um toque.
          </p>
        </motion.div>
      </aside>

      <section className="dot-grid relative flex flex-col items-center justify-center px-4 py-16">
        <div className="absolute top-6 left-6 lg:hidden">
          <Logo />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </section>
    </div>
  );
}
