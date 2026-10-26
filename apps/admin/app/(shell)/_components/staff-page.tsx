import { Suspense } from "react"

import type { Permission } from "@workspace/auth/permissions"

import { EmptyState } from "@/components/shared/empty-state"
import { requirePermission, requireStaff } from "@/lib/dal"

import { PageHead } from "@/components/layout/page-head"

async function Guarded({
  permission,
  children,
}: {
  permission?: Permission
  children: React.ReactNode
}) {
  await (permission ? requirePermission(permission) : requireStaff())
  return children
}

/**
 * Authorizes, then shows the head and the page content. Without children it is the placeholder
 * for a section that has no screen yet. `action` is the page's primary action (A3).
 */
export function StaffPage({
  title,
  description,
  permission,
  action,
  children,
}: {
  title: string
  description: string
  permission?: Permission
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Suspense>
      <Guarded permission={permission}>
        <PageHead title={title} description={description} action={action} />
        {children ?? (
          <EmptyState
            title={`Coming soon: ${title}`}
            description="This section is not built yet."
            className="rounded-lg border border-dashed py-16"
          />
        )}
      </Guarded>
    </Suspense>
  )
}
