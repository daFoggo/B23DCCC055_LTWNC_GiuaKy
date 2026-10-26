import { DashboardBreadcrumb } from "@/components/layout/dashboard-breadcrumb"
import { DASHBOARD_NAV } from "@/config/navigation"
import { requirePermission } from "@/lib/dal"

/**
 * Breadcrumb for the dashboard. To show record names for ids in the URL, load them here and pass
 * `labels` (id to name); an id without a label reads as "details".
 */
export async function DashboardCrumbs() {
  await requirePermission("account:view")
  return <DashboardBreadcrumb sections={DASHBOARD_NAV} />
}
