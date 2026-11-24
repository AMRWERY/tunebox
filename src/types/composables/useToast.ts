export type ToastType = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  /** Set on confirmation toasts; settles the promise returned by `confirm`. */
  resolve?: (confirmed: boolean) => void;
}
