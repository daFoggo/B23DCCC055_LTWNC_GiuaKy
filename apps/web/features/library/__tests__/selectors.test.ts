import { describe, expect, it } from "vitest"

import { SEED_BOOKS } from "../api/booksApi"
import {
  borrowedBooks,
  categoryStats,
  clampPage,
  paginate,
  totalStats,
} from "../selectors"

describe("paginate", () => {
  const items = Array.from({ length: 20 }, (_, index) => index + 1)

  it("slices 8 per page by default", () => {
    expect(paginate(items, 1).items).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(paginate(items, 3).items).toEqual([17, 18, 19, 20])
    expect(paginate(items, 1).totalPages).toBe(3)
  })

  it("clamps an out-of-range page", () => {
    expect(paginate(items, 99).page).toBe(3)
    expect(paginate(items, 0).page).toBe(1)
    expect(clampPage(Number.NaN, 3)).toBe(1)
  })

  it("keeps one empty page when nothing matches", () => {
    expect(paginate([], 4)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      total: 0,
    })
  })
})

describe("category stats", () => {
  it("totals copies per category and overall", () => {
    const rows = categoryStats(SEED_BOOKS)
    const total = totalStats(rows)
    expect(rows.map((row) => row.titles).reduce((a, b) => a + b, 0)).toBe(
      SEED_BOOKS.length
    )
    expect(total.totalCopies).toBe(total.copiesLeft + total.onLoan)
  })

  it("lists borrowed books", () => {
    expect(
      borrowedBooks(SEED_BOOKS, ["b3", "b1"]).map((book) => book.id)
    ).toEqual(["b1", "b3"])
  })
})

describe("SEED_BOOKS", () => {
  it("has about 40 unique, well-formed books", () => {
    expect(SEED_BOOKS.length).toBeGreaterThanOrEqual(40)
    expect(new Set(SEED_BOOKS.map((book) => book.id)).size).toBe(
      SEED_BOOKS.length
    )
    for (const book of SEED_BOOKS) {
      expect(book.year).toBeGreaterThanOrEqual(2010)
      expect(book.year).toBeLessThanOrEqual(2025)
      expect(book.copiesLeft).toBeGreaterThanOrEqual(0)
      expect(book.copiesLeft).toBeLessThanOrEqual(book.totalCopies)
    }
  })
})
