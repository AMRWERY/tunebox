import type { ToastType, ToastItem } from "@/types/composables/useToast";

const DEFAULT_DURATION_MS = 4000;

// Module-level state so every caller shares one toast stack.
const toasts = ref<ToastItem[]>([]);
let nextId = 0;

export const useToast = () => {
  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const show = (
    message: string,
    type: ToastType = "info",
    duration = DEFAULT_DURATION_MS,
  ) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    return id;
  };

  return {
    toasts,
    show,
    dismiss,
    error: (message: string) => show(message, "error", 6000),
    success: (message: string) => show(message, "success"),
    info: (message: string) => show(message, "info"),
  };
};