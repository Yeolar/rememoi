export type ToastDetail = {
  message: string
  time?: number
}

export function showToast(detail: ToastDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<ToastDetail>('rememoi:toast', { detail }))
}
