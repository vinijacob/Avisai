"use client";

import { LogOut, Plus, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";
import { Avatar } from "./ui";

const links = [
  { href: "/eventos", label: "Eventos", adminOnly: false },
  { href: "/usuarios", label: "Usuários", adminOnly: true },
];

export function AppHeader() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/eventos" aria-label="Avisaí">
          <Logo />
        </Link>

        <Suspense fallback={<NavLinks isAdmin={isAdmin} pathname="" />}>
          <ActiveNavLinks isAdmin={isAdmin} />
        </Suspense>

        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/eventos/novo"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink transition hover:brightness-95 active:scale-[0.97]"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Novo evento</span>
            </Link>
          )}
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
}

function ActiveNavLinks({ isAdmin }: { isAdmin: boolean }) {
  return <NavLinks isAdmin={isAdmin} pathname={usePathname()} />;
}

function NavLinks({ isAdmin, pathname }: { isAdmin: boolean; pathname: string }) {
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links
        .filter((link) => !link.adminOnly || isAdmin)
        .map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                active ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-surface-2"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{link.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { name, email, course } = user;
  const isAdmin = user.role === "admin";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-full transition hover:scale-105 active:scale-95"
        aria-label="Menu do usuário"
      >
        <Avatar name={name} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-3xl border border-line bg-surface p-2 shadow-xl"
          >
            <div className="px-3 py-2.5">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-sm text-muted">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] tracking-wide text-muted uppercase">
                  {isAdmin ? "Administrador" : "Aluno"}
                </span>
                {course && <span className="truncate text-xs text-muted">{course}</span>}
              </div>
            </div>
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <UserRound className="size-4" />
              Meu perfil
            </Link>
            {isAdmin && (
              <Link
                href="/usuarios"
                onClick={() => setOpen(false)}
                className="flex rounded-2xl px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink sm:hidden"
              >
                Usuários
              </Link>
            )}
            <button
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
