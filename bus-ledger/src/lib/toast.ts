export const TOAST_EVENT = "busledger:toast";

export type ToastType = "success" | "error" | "info";

export function toast(type: ToastType, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { id: Date.now(), type, message } })
  );
}

export const success = (msg: string) => toast("success", msg);
export const error = (msg: string) => toast("error", msg);
export const info = (msg: string) => toast("info", msg);
