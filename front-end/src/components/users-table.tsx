"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Role, User } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast";
import { Avatar, Skeleton } from "./ui";

const roles: { value: Role; label: string }[] = [
  { value: "student", label: "Aluno" },
  { value: "admin", label: "Admin" },
];

export function UsersTable() {
  const { user: me } = useAuth();
  const notify = useToast();
  const [users, setUsers] = useState<User[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .users()
      .then(setUsers)
      .catch((error) => {
        setUsers([]);
        notify((error as Error).message, "error");
      });
  }, [notify]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (users ?? []).filter(
      (u) => !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );
  }, [users, query]);

  async function changeRole(target: User, role: Role) {
    if (target.role === role) return;
    setUsers((current) => current?.map((u) => (u.id === target.id ? { ...u, role } : u)) ?? null);
    try {
      await api.setRole(target.id, role);
      notify(role === "admin" ? `${target.name} agora é admin.` : `${target.name} agora é aluno.`);
    } catch (error) {
      setUsers((current) => current?.map((u) => (u.id === target.id ? target : u)) ?? null);
      notify((error as Error).message, "error");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="relative sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-accent/40"
        />
      </label>

      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        {users === null ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">Nenhum usuário encontrado.</p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((user, i) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <Avatar name={user.name} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">
                    {user.name}
                    {user.id === me?.id && <span className="ml-2 text-xs font-normal text-muted">(você)</span>}
                  </span>
                  <span className="truncate text-sm text-muted">{user.email}</span>
                </div>
                <div
                  className={cn(
                    "inline-flex rounded-full bg-surface-2 p-1",
                    user.id === me?.id && "pointer-events-none opacity-50",
                  )}
                >
                  {roles.map((role) => {
                    const active = user.role === role.value;
                    return (
                      <button
                        key={role.value}
                        onClick={() => changeRole(user, role.value)}
                        className={cn(
                          "relative cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          active ? (role.value === "admin" ? "text-accent-ink" : "text-ink") : "text-muted",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={`role-${user.id}`}
                            className={cn(
                              "absolute inset-0 rounded-full",
                              role.value === "admin" ? "bg-accent" : "bg-surface shadow-sm",
                            )}
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
