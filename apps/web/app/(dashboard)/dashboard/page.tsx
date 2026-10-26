import type { Metadata } from "next"
import { Suspense } from "react"

import { LibraryView } from "@/features/library/components/library-view"
import { requirePermission } from "@/lib/dal"

export const metadata: Metadata = { title: "Thư viện" }

async function Guard() {
  await requirePermission("account:view")
  return null
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Guard />
      </Suspense>
      <Suspense fallback={<p role="status">Đang tải...</p>}>
        <LibraryView />
      </Suspense>
    </>
  )
}
