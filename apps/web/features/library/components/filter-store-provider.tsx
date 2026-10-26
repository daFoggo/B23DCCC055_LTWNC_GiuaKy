"use client"

import { createContext, use, useState } from "react"
import { useStore } from "zustand"

import {
  createFilterStore,
  type FilterStore,
  type FilterStoreApi,
} from "../filter-store"

const FilterStoreContext = createContext<FilterStoreApi | null>(null)

export function FilterStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [store] = useState(() => createFilterStore())
  return <FilterStoreContext value={store}>{children}</FilterStoreContext>
}

export function useFilterStore<T>(selector: (state: FilterStore) => T): T {
  const store = use(FilterStoreContext)
  if (!store)
    throw new Error("useFilterStore must be used within FilterStoreProvider")
  return useStore(store, selector)
}
