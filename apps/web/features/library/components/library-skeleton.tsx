import { Skeleton } from "@workspace/ui/components/skeleton"

const TABS = ["a", "b", "c", "d"]
const CARDS = ["a", "b", "c", "d", "e", "f"]

export function LibrarySkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <p role="status" className="text-ink-3">
        Đang tải...
      </p>
      <Skeleton className="h-8 w-full" />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex gap-2 md:w-48 md:shrink-0 md:flex-col">
          {TABS.map((key) => (
            <Skeleton key={key} className="h-8 flex-1 md:flex-none" />
          ))}
        </div>
        <div className="@container min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
            {CARDS.map((key) => (
              <Skeleton key={key} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
