"use client"

import { lazy, Suspense } from "react"

const StatsView = lazy(() => import("./stats-view"))

export function LazyStats() {
  return (
    <Suspense fallback={<p role="status">Đang tải...</p>}>
      <StatsView />
    </Suspense>
  )
}
