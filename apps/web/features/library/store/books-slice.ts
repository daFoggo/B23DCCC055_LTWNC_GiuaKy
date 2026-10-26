import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { addDays, parseISO } from "date-fns"

import { fetchBooks as fetchBooksApi } from "../api/booksApi"
import { isErr, type Book, type FetchBooksOptions } from "../types"

export const BORROW_LIMIT = 3
export const LOAN_DAYS = 14
export const BORROW_LIMIT_WARNING = "Bạn chỉ được mượn tối đa 3 cuốn cùng lúc."

export type BooksState = {
  items: Book[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  borrowedIds: string[]
  dueDates: Record<string, string>
  warning: string | null
}

const initialState: BooksState = {
  items: [],
  status: "idle",
  error: null,
  borrowedIds: [],
  dueDates: {},
  warning: null,
}

export const fetchBooks = createAsyncThunk<
  Book[],
  FetchBooksOptions | undefined,
  { rejectValue: string; state: { books: BooksState } }
>(
  "books/fetch",
  async (options, { rejectWithValue }) => {
    const result = await fetchBooksApi(options)
    return isErr(result) ? rejectWithValue(result.error) : result.data
  },
  {
    condition: (_options, { getState }) =>
      getState().books.status !== "loading",
  }
)

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    borrowBook: {
      reducer(
        state,
        action: PayloadAction<{ id: string; borrowedAt: string }>
      ) {
        const { id, borrowedAt } = action.payload
        const book = state.items.find((item) => item.id === id)
        if (!book || book.copiesLeft === 0 || state.borrowedIds.includes(id))
          return
        state.items = state.items.map((item) =>
          item.id === id ? { ...item, copiesLeft: item.copiesLeft - 1 } : item
        )
        state.borrowedIds.push(id)
        state.dueDates[id] = addDays(
          parseISO(borrowedAt),
          LOAN_DAYS
        ).toISOString()
        state.warning = null
      },
      prepare(id: string, borrowedAt: string = new Date().toISOString()) {
        return { payload: { id, borrowedAt } }
      },
    },
    returnBook(state, action: PayloadAction<string>) {
      const id = action.payload
      if (!state.borrowedIds.includes(id)) return
      state.items = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              copiesLeft: Math.min(item.copiesLeft + 1, item.totalCopies),
            }
          : item
      )
      state.borrowedIds = state.borrowedIds.filter(
        (borrowedId) => borrowedId !== id
      )
      delete state.dueDates[id]
      state.warning = null
    },
    borrowRejected(state, action: PayloadAction<string>) {
      state.warning = action.payload
    },
    dismissWarning(state) {
      state.warning = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = "succeeded"
        state.error = null
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed"
        state.error =
          action.payload ?? action.error.message ?? "Lỗi không xác định"
      })
  },
})

export const { borrowBook, returnBook, borrowRejected, dismissWarning } =
  booksSlice.actions
export const booksReducer = booksSlice.reducer
