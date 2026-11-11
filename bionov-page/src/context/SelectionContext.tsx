import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { PACKS, type Pack } from '../data/product'

type SelectionValue = {
  packs: Pack[]
  selected: Pack
  selectedId: string
  select: (id: string) => void
}

const SelectionContext = createContext<SelectionValue | null>(null)

/** Pack 2 is the default so the sticky bar and final CTA open on the best-value tier. */
const DEFAULT_PACK_ID = PACKS[1].id

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(DEFAULT_PACK_ID)

  const value = useMemo<SelectionValue>(() => {
    const selected = PACKS.find((p) => p.id === selectedId) ?? PACKS[0]
    return { packs: PACKS, selected, selectedId: selected.id, select: setSelectedId }
  }, [selectedId])

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection(): SelectionValue {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used inside SelectionProvider')
  return ctx
}
