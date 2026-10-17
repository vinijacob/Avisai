"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Button, Field, Input } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === "login";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) await api.login(email, password);
      else await api.register(name, email, password);
      router.replace("/eventos");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-5xl leading-none tracking-tight">
          {isLogin ? (
            <>
              Bem-vindo <em>de volta</em>
            </>
          ) : (
            <>
              Crie sua <em>conta</em>
            </>
          )}
        </h1>
        <p className="mt-3 text-muted">
          {isLogin ? "Entre para ver os eventos da faculdade." : "Leva menos de um minuto."}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {!isLogin && (
          <Field label="Nome">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
            />
          </Field>
        )}
        <Field label="E-mail">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@faculdade.edu.br"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Senha" hint={isLogin ? undefined : "Mínimo de 8 caracteres"}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={isLogin ? undefined : 8}
          />
        </Field>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" loading={loading} className="group mt-2 h-12">
          {isLogin ? "Entrar" : "Criar conta"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {isLogin ? "Ainda não tem conta? " : "Já tem uma conta? "}
        <Link
          href={isLogin ? "/cadastro" : "/entrar"}
          className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
        >
          {isLogin ? "Cadastre-se" : "Entrar"}
        </Link>
      </p>
    </div>
  );
}
