import {
  hasPermission,
  type Permission,
  type Role,
} from "@workspace/auth/permissions"

/** Names, not components: entries cross from a Server Component to the client sidebar (`nav-icons.tsx`). */
export type NavIconName = "dashboard"

export type NavLink = { title: string; href: string; icon: NavIconName }

export type NavSection = {
  title: string
  permission: Permission
  links: NavLink[]
}

/** Sidebar sections (docs/design-system.md A2). A section the role cannot open is hidden. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    permission: "admin:access",
    links: [{ title: "Dashboard", href: "/", icon: "dashboard" }],
  },
]

export function visibleSections(role: Role): NavSection[] {
  return NAV_SECTIONS.filter((section) =>
    hasPermission(role, section.permission)
  )
}
