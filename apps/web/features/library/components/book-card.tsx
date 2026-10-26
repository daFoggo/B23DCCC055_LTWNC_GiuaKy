"use client"

import { memo } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import type { BookCardData, Category } from "../types"

type BookCardProps = {
  book: BookCardData
  borrowed: boolean
  onBorrow: (id: string) => void
  onReturn?: (id: string) => void
  onOpen?: (id: string) => void
}

export const SPINE_TONE: Record<Category, string> = {
  CNTT: "bg-foreground",
  "Kinh tế": "bg-ink-3",
  "Ngoại ngữ": "bg-ink-4",
}

function Cover({
  book,
  onOpen,
}: {
  book: BookCardData
  onOpen: ((id: string) => void) | undefined
}) {
  const face = (
    <>
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          SPINE_TONE[book.category]
        )}
      />
      <span className="h-px w-6 bg-ink-4" />
      <span className="font-serif text-4xl font-normal">
        {book.title.charAt(0)}
      </span>
    </>
  )
  const className =
    "relative flex aspect-2/3 w-20 shrink-0 flex-col justify-between overflow-hidden border bg-secondary py-2 pr-2 pl-4 text-left text-secondary-foreground"
  if (!onOpen)
    return (
      <div aria-hidden className={className}>
        {face}
      </div>
    )
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      className={className}
      onClick={() => onOpen(book.id)}
    >
      {face}
    </button>
  )
}

export const BookCard = memo(function BookCard({
  book,
  borrowed,
  onBorrow,
  onReturn,
  onOpen,
}: BookCardProps) {
  const soldOut = book.copiesLeft === 0
  const copies =
    book.totalCopies === undefined
      ? `Còn ${book.copiesLeft} cuốn`
      : `Còn ${book.copiesLeft}/${book.totalCopies} cuốn`
  return (
    <Card size="sm" className="@container h-full">
      <CardContent className="flex flex-1 flex-col gap-4 @sm:flex-row">
        <Cover book={book} onOpen={onOpen} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <CardTitle>
              {onOpen ? (
                <button
                  type="button"
                  aria-label={`Xem chi tiết ${book.title}`}
                  className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => onOpen(book.id)}
                >
                  {book.title}
                </button>
              ) : (
                book.title
              )}
            </CardTitle>
            <CardDescription>{book.author}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{book.category}</Badge>
            <span className="text-ink-3">{book.year}</span>
          </div>
          <span className={soldOut ? "text-diff-del" : "text-diff-add"}>
            {soldOut ? "Đã hết" : copies}
          </span>
          {borrowed ? <Badge variant="secondary">Bạn đang mượn</Badge> : null}
        </div>
      </CardContent>
      <CardFooter className="pb-3">
        {borrowed && onReturn ? (
          <Button variant="outline" size="sm" onClick={() => onReturn(book.id)}>
            Trả
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={soldOut || borrowed}
            onClick={() => onBorrow(book.id)}
          >
            {borrowed ? "Đang mượn" : soldOut ? "Hết sách" : "Mượn"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
