export type ToastType = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}
