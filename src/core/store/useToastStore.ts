import { create } from 'zustand'

interface ToastStore {
  message: string | null
  type: 'success' | 'error' | 'warning' | null
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void
  clearToast: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  type: null,

  showToast: (message, type) => {
    set({ message, type })
    setTimeout(() => {
      set({ message: null, type: null })
    }, 6000)
  },

  clearToast: () => set({ message: null, type: null }),
}))
