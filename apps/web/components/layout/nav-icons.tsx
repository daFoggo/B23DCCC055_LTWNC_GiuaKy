import { IconBooks, IconChartBar, type Icon } from "@tabler/icons-react"

import type { NavIconName } from "@/config/navigation"

/** `Record` makes TypeScript fail here when a name is added to `NavIconName` without an icon. */
const NAV_ICONS: Record<NavIconName, Icon> = {
  library: IconBooks,
  stats: IconChartBar,
}

export function NavIcon({ name }: { name: NavIconName }) {
  const Component = NAV_ICONS[name]
  return <Component aria-hidden className="size-4 shrink-0" />
}
