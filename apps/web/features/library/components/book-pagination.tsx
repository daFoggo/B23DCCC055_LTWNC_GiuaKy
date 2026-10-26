"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"

type BookPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BookPagination({
  page,
  totalPages,
  onPageChange,
}: BookPaginationProps) {
  if (totalPages <= 1) return null
  const go = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    onPageChange(target)
  }
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const first = page === 1
  const last = page === totalPages
  return (
    <Pagination aria-label="Phân trang">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="Trước"
            aria-label="Trang trước"
            aria-disabled={first}
            className={first ? "pointer-events-none opacity-50" : undefined}
            onClick={go(Math.max(1, page - 1))}
          />
        </PaginationItem>
        {pages.map((item) => (
          <PaginationItem key={item}>
            <PaginationLink
              href="#"
              isActive={item === page}
              aria-label={`Trang ${item}`}
              onClick={go(item)}
            >
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text="Sau"
            aria-label="Trang sau"
            aria-disabled={last}
            className={last ? "pointer-events-none opacity-50" : undefined}
            onClick={go(Math.min(totalPages, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
