"use client";

import { Toast, ToastPositionClasses } from "@packages/components/bootstrap5/Toasts";
import { ToastColor, ToastContextType, ToastItem, ToastOptions, ToastPosition } from "@packages/types/toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {

    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = (toast: ToastItem) => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        toast?.onClose?.();
    };

    const addToast = useCallback((
      type: ToastColor, 
      position: ToastPosition,
      options: ToastOptions
    ) => {
      const id = crypto.randomUUID();
      const newToast: ToastItem = { id, type, position, ...options };
      setToasts((prev) => [...prev, newToast]);
      // autoHide
      if (options?.autoHide !== false) {
          const delay = options?.delay ?? 1500;
          setTimeout(() => removeToast(newToast), delay);
      }
    }, []);

    // 封裝方法
    const value = useMemo<ToastContextType>(() => ({
        success: (options: ToastOptions, position: ToastPosition = 3) => addToast("success", position, options),
        danger: (options: ToastOptions, position: ToastPosition = 3) => addToast("danger", position, options),
        warning: (options: ToastOptions, position: ToastPosition = 3) => addToast("warning", position, options),
        info: (options: ToastOptions, position: ToastPosition = 3) => addToast("info", position, options),
        primary: (options: ToastOptions, position: ToastPosition = 3) => addToast("primary", position, options),
        secondary: (options: ToastOptions, position: ToastPosition = 3) => addToast("secondary", position, options),
    }), [addToast]);

    return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast-container ${ToastPositionClasses[toasts[0]?.position || 3]}`}>
        {toasts.map((t) => (
          <Toast key={t.id} position={0} color={t.type} title={t.title} autoHide={t?.autoHide ?? true}  delay={t?.delay ?? 1500} onClose={() => removeToast(t)}>
              {t.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
    );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast 必須搭配 <ToastProvider> 使用");
  return ctx;
};
