import { cn } from "@workspace/ui/lib/utils"

// `/none`: line-height 1, so the box is exactly its font size.
const TEXT = {
  sm: "text-sm/none",
  md: "text-lg/none",
  lg: "text-2xl/none",
} as const

/**
 * Text logo (design system § Logo): mono wordmark, no mark, no motion.
 * Pure visual: wrap it in a Link where it should navigate.
 */
export function AppLogo({
  size = "md",
  className,
  textClassName,
}: {
  size?: keyof typeof TEXT
  className?: string
  /** E.g. to hide it inside a collapsed sidebar. */
  textClassName?: string
}) {
  return (
    // Block-level flex: an inline-flex box sits on the text baseline and leaves a gap below it.
    <span className={cn("flex w-fit items-center", className)}>
      <span
        className={cn(
          "font-mono font-medium tracking-tight",
          TEXT[size],
          textClassName
        )}
      >
        Mini Library
      </span>
    </span>
  )
}
