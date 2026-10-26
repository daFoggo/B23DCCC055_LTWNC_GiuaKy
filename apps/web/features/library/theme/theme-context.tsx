"use client"

import { createContext, use, useCallback, useMemo } from "react"
import { useTheme as useNextTheme } from "next-themes"

type LibraryTheme = { theme: "light" | "dark"; toggleTheme: () => void }

const ThemeContext = createContext<LibraryTheme | null>(null)

export function LibraryThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { resolvedTheme, setTheme } = useNextTheme()
  const theme: LibraryTheme["theme"] =
    resolvedTheme === "dark" ? "dark" : "light"
  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme]
  )
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): LibraryTheme {
  const value = use(ThemeContext)
  if (!value)
    throw new Error("useTheme must be used within LibraryThemeProvider")
  return value
}
