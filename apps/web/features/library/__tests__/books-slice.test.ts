import { describe, expect, it } from "vitest"

import { SEED_BOOKS } from "../api/booksApi"
import {
  BORROW_LIMIT_WARNING,
  booksReducer,
  borrowBook,
  fetchBooks,
  returnBook,
  type BooksState,
} from "../store/books-slice"
import { makeStore } from "../store/store"
import { isErr, isOk, type Book } from "../types"

const book = (id: string, copiesLeft: number, totalCopies = 3): Book => ({
  id,
  title: `Sách ${id}`,
  author: "Tác giả",
  category: "CNTT",
  year: 2020,
  copiesLeft,
  totalCopies,
  description: "Mô tả",
  isbn: "9786040000001",
  publisher: "NXB Test",
  pages: 100,
  shelf: "Kệ A1",
})

const state = (overrides: Partial<BooksState> = {}): BooksState => ({
  items: [
    book("b1", 2),
    book("b2", 0),
    book("b3", 1),
    book("b4", 1),
    book("b5", 1),
  ],
  status: "succeeded",
  error: null,
  borrowedIds: [],
  dueDates: {},
  warning: null,
  ...overrides,
})

describe("booksSlice", () => {
  it("fetchBooks.pending/fulfilled/rejected set status, items and error", () => {
    const initial = state({ items: [], status: "idle" })
    const loading = booksReducer(initial, fetchBooks.pending("r1", undefined))
    expect(loading.status).toBe("loading")
    expect(loading.error).toBeNull()

    const ok = booksReducer(
      loading,
      fetchBooks.fulfilled([...SEED_BOOKS], "r1", undefined)
    )
    expect(ok.status).toBe("succeeded")
    expect(ok.items).toHaveLength(SEED_BOOKS.length)

    const failed = booksReducer(
      loading,
      fetchBooks.rejected(new Error("x"), "r1", undefined, "boom")
    )
    expect(failed.status).toBe("failed")
    expect(failed.error).toBe("boom")

    const retried = booksReducer(
      failed,
      fetchBooks.fulfilled([...SEED_BOOKS], "r2", undefined)
    )
    expect(retried.status).toBe("succeeded")
    expect(retried.error).toBeNull()
  })

  it("borrowBook decrements copiesLeft and records the id", () => {
    const next = booksReducer(state({ warning: "w" }), borrowBook("b1"))
    expect(next.items.find((b) => b.id === "b1")?.copiesLeft).toBe(1)
    expect(next.borrowedIds).toEqual(["b1"])
    expect(next.warning).toBeNull()
  })

  it("borrowBook is a no-op at 0 copies or when already borrowed", () => {
    const s = state()
    expect(booksReducer(s, borrowBook("b2"))).toEqual(s)
    expect(booksReducer(s, borrowBook("missing"))).toEqual(s)
    const once = booksReducer(s, borrowBook("b3"))
    const twice = booksReducer(once, borrowBook("b3"))
    expect(twice.items.find((b) => b.id === "b3")?.copiesLeft).toBe(0)
    expect(twice.borrowedIds).toEqual(["b3"])
  })

  it("returnBook restores the copy; a return of a non-borrowed book changes nothing", () => {
    const borrowed = booksReducer(state(), borrowBook("b1"))
    const back = booksReducer({ ...borrowed, warning: "w" }, returnBook("b1"))
    expect(back.items.find((b) => b.id === "b1")?.copiesLeft).toBe(2)
    expect(back.borrowedIds).toEqual([])
    expect(back.warning).toBeNull()

    const s = state()
    expect(booksReducer(s, returnBook("b1"))).toEqual(s)
    const capped = state({ items: [book("b1", 3, 3)], borrowedIds: ["b1"] })
    expect(booksReducer(capped, returnBook("b1")).items[0]?.copiesLeft).toBe(3)
  })

  it("borrowBook stores a due date 14 days after the borrow time and returnBook clears it", () => {
    const at = "2026-10-26T08:00:00.000Z"
    const borrowed = booksReducer(state(), borrowBook("b1", at))
    expect(borrowed.dueDates).toEqual({ b1: "2026-11-09T08:00:00.000Z" })
    const back = booksReducer(borrowed, returnBook("b1"))
    expect(back.dueDates).toEqual({})
  })

  it("middleware blocks the 4th borrow and sets the warning", () => {
    const store = makeStore({
      books: state({ borrowedIds: ["b1", "b3", "b4"] }),
    })
    store.dispatch(borrowBook("b5"))
    const { books } = store.getState()
    expect(books.borrowedIds).toHaveLength(3)
    expect(books.items.find((b) => b.id === "b5")?.copiesLeft).toBe(1)
    expect(books.warning).toBe(BORROW_LIMIT_WARNING)
  })

  it("middleware allows the 3rd borrow and blocks the 4th in one flow", () => {
    const store = makeStore({
      books: state({
        items: [book("b1", 2), book("b3", 1), book("b4", 1), book("b5", 1)],
        borrowedIds: [],
      }),
    })
    store.dispatch(borrowBook("b1"))
    store.dispatch(borrowBook("b3"))
    store.dispatch(borrowBook("b4"))
    expect(store.getState().books.borrowedIds).toEqual(["b1", "b3", "b4"])
    expect(store.getState().books.warning).toBeNull()
    store.dispatch(borrowBook("b5"))
    expect(store.getState().books.borrowedIds).toEqual(["b1", "b3", "b4"])
    expect(store.getState().books.warning).toBe(BORROW_LIMIT_WARNING)
  })

  it("fetchBooks keeps the first request's options when a second one starts while loading", async () => {
    const store = makeStore()
    const first = store.dispatch(fetchBooks({ fail: true, delayMs: 0 }))
    const second = store.dispatch(fetchBooks({ delayMs: 0 }))
    await Promise.all([first, second])
    expect(store.getState().books.status).toBe("failed")
  })

  it("isOk and isErr distinguish both ApiResult cases", () => {
    const ok = { ok: true, data: 1 } as const
    const err = { ok: false, error: "x" } as const
    expect([isOk(ok), isErr(ok)]).toEqual([true, false])
    expect([isOk(err), isErr(err)]).toEqual([false, true])
  })
})
