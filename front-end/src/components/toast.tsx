"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; kind: "success" | "error" };
type Notify = (message: string, kind?: Toast["kind"]) => void;

const ToastContext = createContext<Notify>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback<Notify>((message, kind = "success") => {
    const id = ++nextId;
    setToasts((current) => [...current.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className="flex items-center gap-2.5 rounded-full bg-ink py-2.5 pr-5 pl-3 text-sm font-medium text-bg shadow-2xl"
            >
              {toast.kind === "success" ? (
                <CircleCheck className="size-5 text-accent" />
              ) : (
                <CircleAlert className="size-5 text-danger" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
