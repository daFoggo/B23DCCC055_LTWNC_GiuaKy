"use client"

import { InspectorCommand } from "@/components/layout/inspector"

import { BORROW_LIMIT } from "../store/books-slice"
import { useAppSelector } from "../store/hooks"

export function BorrowedCommand() {
  const count = useAppSelector((state) => state.books.borrowedIds.length)
  return <InspectorCommand label={`Sách của tôi · ${count}/${BORROW_LIMIT}`} />
}
