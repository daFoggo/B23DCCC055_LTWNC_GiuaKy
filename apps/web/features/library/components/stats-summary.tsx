"use client"

import { useCallback, useMemo } from "react"

import { Button } from "@workspace/ui/components/button"

import { categoryStats, totalStats } from "../selectors"
import { fetchBooks } from "../store/books-slice"
import { useAppDispatch, useAppSelector } from "../store/hooks"

export function StatsSummary() {
  const dispatch = useAppDispatch()
  const error = useAppSelector((state) => state.books.error)
  const items = useAppSelector((state) => state.books.items)
  const status = useAppSelector((state) => state.books.status)
  const total = useMemo(() => totalStats(categoryStats(items)), [items])

  const handleRetry = useCallback(() => void dispatch(fetchBooks()), [dispatch])

  if (status === "failed") {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="xs" onClick={handleRetry}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (status !== "succeeded") return <p role="status">Đang tải...</p>

  const entries = [
    ["Đầu sách", total.titles],
    ["Đã cho mượn (cuốn)", total.onLoan],
    ["Còn lại (cuốn)", total.copiesLeft],
  ] as const
  return (
    <dl className="flex flex-wrap gap-8">
      {entries.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1.5">
          <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
          <dd className="text-2xl font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
