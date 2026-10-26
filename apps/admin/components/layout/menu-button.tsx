"use client"

import { IconMenu2 } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { useSidebar } from "@workspace/ui/components/sidebar"

/** Opens the sidebar Sheet below `md`; 44px touch target (A9). */
export function MenuButton() {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="md:hidden"
      onClick={toggleSidebar}
      aria-label="Open menu"
    >
      <IconMenu2 aria-hidden />
    </Button>
  )
}
