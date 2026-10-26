"use client"

import { useCallback } from "react"
import { useStore } from "react-redux"

import { toast } from "@workspace/ui/components/toast"

import { borrowBook, returnBook } from "../store/books-slice"
import { useAppDispatch } from "../store/hooks"
import type { RootState } from "../store/store"

export function useBorrowActions() {
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const titleOf = useCallback(
    (id: string) =>
      store.getState().books.items.find((item) => item.id === id)?.title,
    [store]
  )

  const handleBorrow = useCallback(
    (id: string) => {
      const title = titleOf(id)
      if (borrowBook.match(dispatch(borrowBook(id))) && title)
        toast.add({ type: "success", title: `Đã mượn "${title}"` })
    },
    [dispatch, titleOf]
  )
  const handleReturn = useCallback(
    (id: string) => {
      const title = titleOf(id)
      dispatch(returnBook(id))
      if (title) toast.add({ type: "success", title: `Đã trả "${title}"` })
    },
    [dispatch, titleOf]
  )
  return { handleBorrow, handleReturn }
}
