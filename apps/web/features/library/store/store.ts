import { configureStore } from "@reduxjs/toolkit"

import { booksReducer, type BooksState } from "./books-slice"
import { borrowLimitMiddleware } from "./borrow-limit-middleware"

export const makeStore = (preloadedState?: { books: BooksState }) =>
  configureStore({
    reducer: { books: booksReducer },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(borrowLimitMiddleware),
  })

type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
