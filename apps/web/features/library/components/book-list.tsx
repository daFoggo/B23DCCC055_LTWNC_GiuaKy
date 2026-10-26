"use client"

import { IconBooksOff } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"

import type { Book } from "../types"
import { BookCard } from "./book-card"

type BookListProps = {
  books: readonly Book[]
  borrowedIds: readonly string[]
  onBorrow: (id: string) => void
  onReturn: (id: string) => void
  onOpen?: (id: string) => void
  onClearFilters?: () => void
}

export function BookList({
  books,
  borrowedIds,
  onBorrow,
  onReturn,
  onOpen,
  onClearFilters,
}: BookListProps) {
  if (books.length === 0) {
    return (
      <Empty className="border py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconBooksOff aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Không tìm thấy sách phù hợp</EmptyTitle>
          <EmptyDescription>
            Thử đổi từ khoá hoặc chọn thể loại khác.
          </EmptyDescription>
        </EmptyHeader>
        {onClearFilters ? (
          <Button variant="outline" onClick={onClearFilters}>
            Xoá bộ lọc
          </Button>
        ) : null}
      </Empty>
    )
  }
  return (
    <div className="@container">
      <ul className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard
              book={book}
              borrowed={borrowedIds.includes(book.id)}
              onBorrow={onBorrow}
              onReturn={onReturn}
              onOpen={onOpen}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
