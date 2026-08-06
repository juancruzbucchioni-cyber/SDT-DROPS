import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";

type ToastItem = { id: number; message: string; exiting: boolean };

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string) => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-3), { id, message, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 2500);
  }, []);

  return { toasts, show };
}

export function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 rounded-xl border border-[#C5D5ED] bg-[#F3F5F7] px-4 py-3 shadow-[0_10px_30px_rgba(7,22,50,.15)] ${toast.exiting ? "toast-exit" : "toast-enter"}`}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-sm font-medium text-foreground">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
