import { describe, expect, it } from "vitest"

import { createFilterStore } from "../filter-store"

describe("filter store page", () => {
  it("resets to page 1 when query or category changes", () => {
    const store = createFilterStore()
    store.getState().setPage(3)
    store.getState().setQuery("react")
    expect(store.getState().page).toBe(1)
    store.getState().setPage(2)
    store.getState().setCategory("CNTT")
    expect(store.getState().page).toBe(1)
  })
})
