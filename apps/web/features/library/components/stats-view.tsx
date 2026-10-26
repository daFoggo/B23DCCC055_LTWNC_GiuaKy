"use client"

import { useCallback, useEffect, useMemo } from "react"
import Link from "next/link"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { DASHBOARD_PATH } from "@/config/routes"

import { DueDate } from "./due-date"
import { useBorrowActions } from "../hooks/use-borrow-actions"
import { borrowedBooks, categoryStats, totalStats } from "../selectors"
import { fetchBooks } from "../store/books-slice"
import { useAppDispatch, useAppSelector } from "../store/hooks"

export default function StatsView() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.books.items)
  const status = useAppSelector((state) => state.books.status)
  const error = useAppSelector((state) => state.books.error)
  const borrowedIds = useAppSelector((state) => state.books.borrowedIds)
  const dueDates = useAppSelector((state) => state.books.dueDates)
  const { handleReturn } = useBorrowActions()

  useEffect(() => {
    if (status === "idle") void dispatch(fetchBooks())
  }, [status, dispatch])

  const rows = useMemo(() => categoryStats(items), [items])
  const total = useMemo(() => totalStats(rows), [rows])
  const borrowed = useMemo(
    () => borrowedBooks(items, borrowedIds),
    [items, borrowedIds]
  )

  const handleRetry = useCallback(() => void dispatch(fetchBooks()), [dispatch])

  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không tải được số liệu thống kê</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="xs" onClick={handleRetry}>
            Thử lại
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  if (status !== "succeeded") return <p role="status">Đang tải...</p>

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-medium">Theo thể loại</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thể loại</TableHead>
              <TableHead className="text-right">Số đầu sách</TableHead>
              <TableHead className="text-right">Tổng số cuốn</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
              <TableHead className="text-right">Đang mượn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell className="text-right">{row.titles}</TableCell>
                <TableCell className="text-right">{row.totalCopies}</TableCell>
                <TableCell className="text-right">{row.copiesLeft}</TableCell>
                <TableCell className="text-right">{row.onLoan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Tổng</TableCell>
              <TableCell className="text-right">{total.titles}</TableCell>
              <TableCell className="text-right">{total.totalCopies}</TableCell>
              <TableCell className="text-right">{total.copiesLeft}</TableCell>
              <TableCell className="text-right">{total.onLoan}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>
      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-medium">Sách bạn đang mượn</h2>
        {borrowed.length === 0 ? (
          <Empty className="border py-14">
            <EmptyHeader>
              <EmptyTitle>Bạn chưa mượn cuốn nào</EmptyTitle>
              <EmptyDescription>
                Sách bạn mượn sẽ hiển thị ở đây.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              render={<Link href={DASHBOARD_PATH} />}
              nativeButton={false}
            >
              Tìm sách để mượn
            </Button>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sách</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Thể loại</TableHead>
                <TableHead>Hạn trả</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowed.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>
                    {dueDates[book.id] ? (
                      <DueDate iso={dueDates[book.id]!} bare />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Trả sách ${book.title}`}
                      onClick={() => handleReturn(book.id)}
                    >
                      Trả
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
