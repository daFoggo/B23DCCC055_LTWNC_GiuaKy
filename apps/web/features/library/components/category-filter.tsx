"use client"

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { useMediaQuery } from "@/hooks/use-media-query"

import { CATEGORIES, isFilterCategory, type CategoryCounts } from "../types"
import { useFilterStore } from "./filter-store-provider"

type CategoryFilterProps = { counts: CategoryCounts; total: number }

function Count({ value }: { value: number }) {
  return <span className="ml-auto font-mono text-xs text-ink-3">{value}</span>
}

export function CategoryFilter({ counts, total }: CategoryFilterProps) {
  const category = useFilterStore((state) => state.category)
  const setCategory = useFilterStore((state) => state.setCategory)
  const wide = useMediaQuery("(min-width: 48rem)")
  return (
    <Tabs
      orientation={wide ? "vertical" : "horizontal"}
      value={category}
      onValueChange={(value) => {
        if (isFilterCategory(value)) setCategory(value)
      }}
    >
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="all">
          Tất cả
          <Count value={total} />
        </TabsTrigger>
        {CATEGORIES.map((item) => (
          <TabsTrigger key={item} value={item}>
            {item}
            <Count value={counts[item]} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
