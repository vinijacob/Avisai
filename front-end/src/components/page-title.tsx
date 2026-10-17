"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function PageTitle({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="mb-10 flex flex-col gap-3"
    >
      <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">{eyebrow}</p>
      <h1 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl">{children}</h1>
    </motion.header>
  );
}
