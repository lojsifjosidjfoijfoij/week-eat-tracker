import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; title: string; description?: string; variant?: "default" | "error" | "success" };
type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((all) => {
      // Don't stack identical messages (e.g. several failed saves while offline)
      if (all.some((t) => t.title === input.title && t.description === input.description)) return all;
      return [...all.slice(-2), { id, ...input }];
    });
    window.setTimeout(() => dismiss(id), input.variant === "error" ? 5000 : 3200);
  }, [dismiss]);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} className={`toast toast--${t.variant ?? "default"}`} onClick={() => dismiss(t.id)}>
            <span className="toast__title">{t.title}</span>
            {t.description && <span className="toast__desc">{t.description}</span>}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
