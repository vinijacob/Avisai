"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { Skeleton } from "./ui";

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Skeleton className="h-96 rounded-[28px]" />;
  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ShieldAlert className="size-8 text-muted" />
        <p className="font-medium">Área restrita</p>
        <p className="text-sm text-muted">Apenas coordenadores e professores podem acessar esta página.</p>
      </div>
    );
  }
  return children;
}
