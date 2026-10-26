import {
  CATEGORIES,
  type Book,
  type CategoryCounts,
  type CategoryStat,
  type FilterCategory,
  type Page,
} from "./types"

const PAGE_SIZE = 8

const normalize = (value: string) => value.trim().toLocaleLowerCase("vi")

export function filterBooks(
  books: readonly Book[],
  query: string,
  category: FilterCategory
): Book[] {
  const needle = normalize(query)
  return books.filter(
    (book) =>
      (category === "all" || book.category === category) &&
      (needle === "" ||
        normalize(book.title).includes(needle) ||
        normalize(book.author).includes(needle))
  )
}

export function countByCategory(books: readonly Book[]): CategoryCounts {
  const counts: CategoryCounts = { CNTT: 0, "Kinh tế": 0, "Ngoại ngữ": 0 }
  for (const book of books) counts[book.category] += 1
  return counts
}

export function clampPage(page: number, totalPages: number): number {
  const safe = Number.isFinite(page) ? Math.trunc(page) : 1
  return Math.min(Math.max(safe, 1), Math.max(totalPages, 1))
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = clampPage(page, totalPages)
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
  }
}

export function categoryStats(books: readonly Book[]): CategoryStat[] {
  return CATEGORIES.map((category) => {
    const inCategory = books.filter((book) => book.category === category)
    const totalCopies = inCategory.reduce(
      (sum, book) => sum + book.totalCopies,
      0
    )
    const copiesLeft = inCategory.reduce(
      (sum, book) => sum + book.copiesLeft,
      0
    )
    return {
      category,
      titles: inCategory.length,
      totalCopies,
      copiesLeft,
      onLoan: totalCopies - copiesLeft,
    }
  })
}

export function totalStats(
  rows: readonly CategoryStat[]
): Omit<CategoryStat, "category"> {
  return rows.reduce(
    (sum, row) => ({
      titles: sum.titles + row.titles,
      totalCopies: sum.totalCopies + row.totalCopies,
      copiesLeft: sum.copiesLeft + row.copiesLeft,
      onLoan: sum.onLoan + row.onLoan,
    }),
    { titles: 0, totalCopies: 0, copiesLeft: 0, onLoan: 0 }
  )
}

export function borrowedBooks(
  books: readonly Book[],
  borrowedIds: readonly string[]
): Book[] {
  return books.filter((book) => borrowedIds.includes(book.id))
}
