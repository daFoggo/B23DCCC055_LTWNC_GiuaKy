import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHead } from "@/components/layout/page-head"
import { LazyStats } from "@/features/library/components/lazy-stats"
import { requirePermission } from "@/lib/dal"

export const metadata: Metadata = { title: "Thống kê" }

async function Guard() {
  await requirePermission("account:view")
  return null
}

export default function StatsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Guard />
      </Suspense>
      <PageHead label="Thư viện" title="Thống kê" />
      <LazyStats />
    </>
  )
}
