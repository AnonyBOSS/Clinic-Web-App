"use client";

import { useToast } from "./ToastContext";

export default function ToastView() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live={t.type === "error" ? "assertive" : "polite"}
          className={`toast-card ${
            t.type === "success"
              ? "toast-success"
              : t.type === "error"
              ? "toast-error"
              : "toast-info"
          }`}
        >
          <div className="flex-1 text-sm">{t.message}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(t.id)}
              className="px-2 py-1 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
