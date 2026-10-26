"use client"

import { useState } from "react"
import { Provider } from "react-redux"

import { makeStore } from "../store/store"
import { LibraryThemeProvider } from "../theme/theme-context"
import { FilterStoreProvider } from "./filter-store-provider"

export function LibraryProviders({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => makeStore())
  return (
    <Provider store={store}>
      <FilterStoreProvider>
        <LibraryThemeProvider>{children}</LibraryThemeProvider>
      </FilterStoreProvider>
    </Provider>
  )
}
