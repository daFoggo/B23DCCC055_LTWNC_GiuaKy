import { createStore } from "zustand/vanilla"

import type { FilterCategory } from "./types"

export type FilterState = {
  query: string
  category: FilterCategory
  page: number
}
export type FilterActions = {
  setQuery: (query: string) => void
  setCategory: (category: FilterCategory) => void
  setPage: (page: number) => void
  reset: () => void
}
export type FilterStore = FilterState & FilterActions

export const defaultFilterState: FilterState = {
  query: "",
  category: "all",
  page: 1,
}

export const createFilterStore = (init: FilterState = defaultFilterState) =>
  createStore<FilterStore>()((set, _get, store) => ({
    ...init,
    setQuery: (query) => set({ query, page: 1 }),
    setCategory: (category) => set({ category, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set(store.getInitialState()),
  }))

export type FilterStoreApi = ReturnType<typeof createFilterStore>
