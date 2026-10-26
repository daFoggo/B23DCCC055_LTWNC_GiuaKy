"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"

import { useBorrowActions } from "../hooks/use-borrow-actions"
import { useDebounce } from "../hooks/use-debounce"
import { PageHead } from "@/components/layout/page-head"

import { countByCategory, filterBooks, paginate } from "../selectors"
import { fetchBooks } from "../store/books-slice"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { BookDetailDialog } from "./book-detail-dialog"
import { BookList } from "./book-list"
import { BookPagination } from "./book-pagination"
import { CategoryFilter } from "./category-filter"
import { useFilterStore } from "./filter-store-provider"
import { LibrarySkeleton } from "./library-skeleton"
import { SearchBox } from "./search-box"

export function LibraryView() {
  const dispatch = useAppDispatch()
  const fail = useSearchParams().get("fail") === "1"
  const items = useAppSelector((state) => state.books.items)
  const status = useAppSelector((state) => state.books.status)
  const error = useAppSelector((state) => state.books.error)
  const borrowedIds = useAppSelector((state) => state.books.borrowedIds)
  const query = useFilterStore((state) => state.query)
  const category = useFilterStore((state) => state.category)
  const page = useFilterStore((state) => state.page)
  const setPage = useFilterStore((state) => state.setPage)
  const reset = useFilterStore((state) => state.reset)
  const catalogueRef = useRef<HTMLDivElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (status === "idle") void dispatch(fetchBooks({ fail }))
  }, [status, fail, dispatch])

  const filtered = useMemo(
    () => filterBooks(items, debouncedQuery, category),
    [items, debouncedQuery, category]
  )

  const current = useMemo(() => paginate(filtered, page), [filtered, page])
  const counts = useMemo(() => countByCategory(items), [items])

  const { handleBorrow, handleReturn } = useBorrowActions()
  const handlePageChange = useCallback(
    (next: number) => {
      setPage(next)
      catalogueRef.current?.scrollIntoView({ block: "start" })
    },
    [setPage]
  )
  const handleOpen = useCallback((id: string) => setOpenId(id), [])
  const handleClose = useCallback(() => setOpenId(null), [])
  const handleRetry = useCallback(() => void dispatch(fetchBooks()), [dispatch])

  const head = (
    <PageHead label="Thư viện" title="Tra cứu & mượn sách">
      {status === "succeeded"
        ? `Thư viện hiện có ${items.length} đầu sách chuyên ngành.`
        : "Tìm sách, xem còn cuốn nào và mượn ngay."}
    </PageHead>
  )

  if (status === "failed") {
    return (
      <>
        {head}
        <Alert variant="destructive">
          <AlertTitle>Không tải được danh sách sách</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="xs" onClick={handleRetry}>
              Thử lại
            </Button>
          </AlertAction>
        </Alert>
      </>
    )
  }

  if (status !== "succeeded") {
    return (
      <>
        {head}
        <LibrarySkeleton />
      </>
    )
  }

  return (
    <>
      {head}
      <div ref={catalogueRef} className="flex scroll-mt-10 flex-col gap-8">
        <SearchBox />
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="shrink-0 md:w-48">
            <CategoryFilter counts={counts} total={items.length} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <p aria-live="polite" className="text-ink-3">
              {`Hiển thị ${current.items.length} trong ${filtered.length} sách`}
              {filtered.length === items.length
                ? ""
                : ` (tổng ${items.length} sách)`}
            </p>
            <BookList
              books={current.items}
              borrowedIds={borrowedIds}
              onBorrow={handleBorrow}
              onReturn={handleReturn}
              onOpen={handleOpen}
              onClearFilters={
                query === "" && category === "all" ? undefined : reset
              }
            />
            <BookPagination
              page={current.page}
              totalPages={current.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <BookDetailDialog
        bookId={openId}
        onClose={handleClose}
        onBorrow={handleBorrow}
        onReturn={handleReturn}
      />
    </>
  )
}
