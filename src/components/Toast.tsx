import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast = ({ toasts, onDismiss }: ToastProps) => {
  return (
    <div 
      className="fixed bottom-3 sm:bottom-5 right-3 sm:right-5 z-50 flex flex-col gap-1.5 max-w-xs sm:max-w-sm w-auto pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({
  toast,
  onDismiss,
}: { toast: ToastMessage; onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white dark:bg-zinc-900/95 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-md',
    error: 'bg-white dark:bg-zinc-900/95 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-md',
    info: 'bg-white dark:bg-zinc-900/95 border-sky-500/40 text-sky-950 dark:text-sky-100 shadow-md',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-150 animate-in slide-in-from-bottom-2 ${bgStyles[toast.type]}`}
      role="status"
    >
      <div className="flex items-center gap-2 min-w-0">
        {icons[toast.type]}
        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
