"use client"

import { Button } from "@workspace/ui/components/button"
import { Progress, ProgressLabel } from "@workspace/ui/components/progress"

import { BORROW_LIMIT } from "../store/books-slice"
import { DueDate } from "./due-date"
import type { Book } from "../types"

type BorrowedPanelProps = {
  books: readonly Book[]
  onReturn: (id: string) => void
  dueDates: Readonly<Record<string, string>>
}

export function BorrowedPanel({
  books,
  onReturn,
  dueDates,
}: BorrowedPanelProps) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="font-mono text-xs tracking-wider text-ink-3 uppercase">{`Đang mượn ${books.length}/${BORROW_LIMIT}`}</h3>
      <Progress value={books.length} max={BORROW_LIMIT}>
        <ProgressLabel className="sr-only">Số sách đang mượn</ProgressLabel>
      </Progress>
      {books.length === 0 ? (
        <p className="text-muted-foreground">Bạn chưa mượn cuốn nào.</p>
      ) : (
        <ul className="flex flex-col">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center justify-between gap-4 border-b py-3"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span>{book.title}</span>
                <span className="text-ink-3">{book.author}</span>
                {dueDates[book.id] ? (
                  <DueDate iso={dueDates[book.id]!} />
                ) : null}
              </span>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Trả sách ${book.title}`}
                onClick={() => onReturn(book.id)}
              >
                Trả
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
