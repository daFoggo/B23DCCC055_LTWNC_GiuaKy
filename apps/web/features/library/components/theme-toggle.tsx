"use client"

import { IconMoon, IconSun } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"

import { useHotkey } from "@/hooks/use-hotkey"

import { useTheme } from "../theme/theme-context"

export function ThemeToggle() {
  const { toggleTheme } = useTheme()
  useHotkey("d", toggleTheme)
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Chuyển giao diện sáng / tối"
      onClick={toggleTheme}
    >
      <IconSun aria-hidden className="dark:hidden" />
      <IconMoon aria-hidden className="hidden dark:block" />
    </Button>
  )
}
