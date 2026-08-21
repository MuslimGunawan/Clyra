"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";

export type ToastType = "success" | "info" | "copied" | "error";

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "copied") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0f121d]/95 text-slate-100 text-xs font-semibold border border-indigo-500/40 shadow-2xl backdrop-blur-xl animate-slideUp pointer-events-auto"
          >
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log(msg),
    };
  }
  return context;
}
