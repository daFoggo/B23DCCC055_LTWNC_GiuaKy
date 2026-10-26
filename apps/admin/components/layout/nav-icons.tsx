import { IconLayoutDashboard, type Icon } from "@tabler/icons-react"

import type { NavIconName } from "@/config/navigation"

/** A `Record`, so a new name without an icon fails typecheck. */
export const NAV_ICONS: Record<NavIconName, Icon> = {
  dashboard: IconLayoutDashboard,
}
