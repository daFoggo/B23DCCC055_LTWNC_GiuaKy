import { toast } from "@workspace/ui/components/toast"

import type { ActionResult } from "@/lib/action-result"

export type ToastPayload = {
  title: string
  description?: string
  type: "success" | "error"
}

/** Pure mapping from a save result to the toast shown for it (A8: never a silent failure). */
export function toastPayload(result: ActionResult, okTitle: string): ToastPayload {
  if (result.ok) return { title: okTitle, type: "success" }
  return { title: "Could not save", description: result.error, type: "error" }
}

export const notify = {
  result(result: ActionResult, okTitle: string) {
    toast.add(toastPayload(result, okTitle))
  },
  error(reason: string) {
    toast.add({ title: "Something went wrong", description: reason, type: "error" })
  },
}
