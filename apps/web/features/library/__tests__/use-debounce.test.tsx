// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDebounce } from "../hooks/use-debounce"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("returns the latest value only after 300ms", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "a" },
    })
    rerender({ v: "ab" })
    act(() => vi.advanceTimersByTime(200))
    rerender({ v: "abc" })
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe("a")
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe("abc")
  })
})
