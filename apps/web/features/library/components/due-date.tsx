import { format, isBefore, parseISO } from "date-fns"

import { cn } from "@workspace/ui/lib/utils"

export function DueDate({
  iso,
  className,
  bare = false,
}: {
  iso: string
  className?: string
  bare?: boolean
}) {
  const due = parseISO(iso)
  const overdue = isBefore(due, new Date())
  return (
    <span className={cn(overdue ? "text-diff-del" : "text-ink-3", className)}>
      {`${bare ? "" : "Hạn trả "}${format(due, "dd/MM/yyyy")}`}
      {overdue ? " (quá hạn)" : ""}
    </span>
  )
}
