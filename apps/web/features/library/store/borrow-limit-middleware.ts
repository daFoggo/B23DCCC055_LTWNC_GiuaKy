import type { Middleware } from "@reduxjs/toolkit"

import {
  BORROW_LIMIT,
  BORROW_LIMIT_WARNING,
  borrowBook,
  borrowRejected,
  type BooksState,
} from "./books-slice"

export const borrowLimitMiddleware: Middleware<object, { books: BooksState }> =
  (api) => (next) => (action) => {
    if (
      borrowBook.match(action) &&
      api.getState().books.borrowedIds.length >= BORROW_LIMIT
    ) {
      return api.dispatch(borrowRejected(BORROW_LIMIT_WARNING))
    }
    return next(action)
  }
