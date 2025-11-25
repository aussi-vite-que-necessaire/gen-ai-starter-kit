import { create } from "zustand"

type ConfirmOptions = {
  title: string
  message: string
  variant?: "danger" | "info"
}

type ConfirmStore = {
  isOpen: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
  ask: (options: ConfirmOptions) => Promise<boolean>
  close: () => void
  confirm: () => void
  cancel: () => void
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  options: { title: "", message: "" },
  resolve: null,

  // Cette fonction renvoie une Promise qui attend la réponse de l'utilisateur
  ask: (options) => {
    return new Promise((resolve) => {
      set({ isOpen: true, options, resolve })
    })
  },

  close: () => set({ isOpen: false, resolve: null }),

  confirm: () => {
    const { resolve, close } = get()
    if (resolve) resolve(true) // On résout la promesse à TRUE
    close()
  },

  cancel: () => {
    const { resolve, close } = get()
    if (resolve) resolve(false) // On résout la promesse à FALSE
    close()
  },
}))

// Petit hook raccourci pour l'utiliser facilement
export const useConfirm = () => {
  const ask = useConfirmStore((s) => s.ask)
  return { confirm: ask }
}
