"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Progress, ProgressLabel } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

import {
  DialogActions,
  ResponsiveDialog,
} from "@/components/shared/responsive-dialog"

import { LOAN_DAYS } from "../store/books-slice"
import { useAppSelector } from "../store/hooks"
import type { Book } from "../types"
import { SPINE_TONE } from "./book-card"
import { DueDate } from "./due-date"

type BookDetailDialogProps = {
  bookId: string | null
  onClose: () => void
  onBorrow: (id: string) => void
  onReturn: (id: string) => void
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-mono text-xs tracking-wider text-ink-3 uppercase">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  )
}

function Body({
  book,
  borrowed,
  dueDate,
  onBorrow,
  onReturn,
  onClose,
}: {
  book: Book
  borrowed: boolean
  dueDate: string | undefined
  onBorrow: (id: string) => void
  onReturn: (id: string) => void
  onClose: () => void
}) {
  const soldOut = book.copiesLeft === 0
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div
          aria-hidden
          className="relative flex aspect-2/3 w-24 shrink-0 flex-col justify-between self-center overflow-hidden border bg-secondary py-3 pr-3 pl-6 text-secondary-foreground sm:w-40 sm:self-start"
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 w-2",
              SPINE_TONE[book.category]
            )}
          />
          <span className="h-px w-10 bg-ink-4" />
          <span className="font-serif text-6xl font-normal sm:text-8xl">
            {book.title.charAt(0)}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-medium">{book.title}</h3>
            <p className="text-ink-2">{book.author}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{book.category}</Badge>
              <span className="text-ink-3">{book.year}</span>
              {borrowed ? (
                <Badge variant="secondary">Bạn đang mượn</Badge>
              ) : null}
            </div>
          </div>
          <p className="text-ink-2">{book.description}</p>
          <dl className="grid grid-cols-2 gap-5">
            <Fact label="Nhà xuất bản" value={book.publisher} />
            <Fact label="ISBN" value={book.isbn} />
            <Fact label="Số trang" value={String(book.pages)} />
            <Fact label="Vị trí" value={book.shelf} />
          </dl>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-5">
        <Progress value={book.copiesLeft} max={book.totalCopies}>
          <ProgressLabel
            className={soldOut ? "text-diff-del" : "text-diff-add"}
          >
            {soldOut
              ? "Đã hết"
              : `Còn ${book.copiesLeft}/${book.totalCopies} cuốn`}
          </ProgressLabel>
        </Progress>
        <p className="text-ink-3">{`Thời hạn mượn ${LOAN_DAYS} ngày`}</p>
        {borrowed && dueDate ? <DueDate iso={dueDate} /> : null}
      </div>
      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        {borrowed ? (
          <Button onClick={() => onReturn(book.id)}>Trả</Button>
        ) : (
          <Button disabled={soldOut} onClick={() => onBorrow(book.id)}>
            {soldOut ? "Hết sách" : "Mượn"}
          </Button>
        )}
      </DialogActions>
    </div>
  )
}

export function BookDetailDialog({
  bookId,
  onClose,
  onBorrow,
  onReturn,
}: BookDetailDialogProps) {
  const book = useAppSelector((state) =>
    bookId === null
      ? undefined
      : state.books.items.find((item) => item.id === bookId)
  )
  const borrowed = useAppSelector(
    (state) => bookId !== null && state.books.borrowedIds.includes(bookId)
  )
  const dueDate = useAppSelector((state) =>
    bookId === null ? undefined : state.books.dueDates[bookId]
  )

  if (!book) return null
  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Chi tiết sách"
      description={`${book.title} · ${book.author}`}
      size="lg"
    >
      <Body
        book={book}
        borrowed={borrowed}
        dueDate={dueDate}
        onBorrow={onBorrow}
        onReturn={onReturn}
        onClose={onClose}
      />
    </ResponsiveDialog>
  )
}
