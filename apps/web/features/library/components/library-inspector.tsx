"use client"

import { useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"

import { DASHBOARD_PATH, STATS_PATH } from "@/config/routes"

import { useBorrowActions } from "../hooks/use-borrow-actions"
import { borrowedBooks as selectBorrowed } from "../selectors"
import { fetchBooks } from "../store/books-slice"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { BorrowedPanel } from "./borrowed-panel"
import { StatsSummary } from "./stats-summary"

export function LibraryInspector() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const items = useAppSelector((state) => state.books.items)
  const status = useAppSelector((state) => state.books.status)
  const borrowedIds = useAppSelector((state) => state.books.borrowedIds)
  const dueDates = useAppSelector((state) => state.books.dueDates)
  const borrowed = useMemo(
    () => selectBorrowed(items, borrowedIds),
    [items, borrowedIds]
  )
  const { handleReturn } = useBorrowActions()

  const pageFetches = pathname === DASHBOARD_PATH
  useEffect(() => {
    if (!pageFetches && status === "idle") void dispatch(fetchBooks())
  }, [pageFetches, status, dispatch])

  return (
    <>
      <BorrowedPanel
        books={borrowed}
        onReturn={handleReturn}
        dueDates={dueDates}
      />
      {pathname === STATS_PATH ? null : (
        <section className="flex flex-col gap-5">
          <h3 className="font-mono text-xs tracking-wider text-ink-3 uppercase">
            Toàn thư viện
          </h3>
          <StatsSummary />
        </section>
      )}
    </>
  )
}
