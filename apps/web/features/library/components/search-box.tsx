"use client"

import { IconSearch, IconX } from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

import { useFilterStore } from "./filter-store-provider"

const LABEL = "Tìm theo tên sách hoặc tác giả"

export function SearchBox() {
  const query = useFilterStore((state) => state.query)
  const setQuery = useFilterStore((state) => state.setQuery)
  return (
    <InputGroup>
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        enterKeyHint="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={LABEL}
        placeholder={LABEL}
      />
      {query ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Xoá từ khoá tìm kiếm"
            onClick={() => setQuery("")}
          >
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
