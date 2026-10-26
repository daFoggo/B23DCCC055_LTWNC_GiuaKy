export const CATEGORIES = ["CNTT", "Kinh tế", "Ngoại ngữ"] as const

export type Category = (typeof CATEGORIES)[number]
export type FilterCategory = "all" | Category

export type Book = Readonly<{
  id: string
  title: string
  author: string
  category: Category
  year: number
  copiesLeft: number
  totalCopies: number
  description: string
  isbn: string
  publisher: string
  pages: number
  shelf: string
}>

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

export type FetchBooksOptions = Partial<{ fail: boolean; delayMs: number }>
export type CategoryCounts = Record<Category, number>
export type BookCardData = Pick<
  Book,
  "id" | "title" | "author" | "category" | "year" | "copiesLeft"
> &
  Partial<Pick<Book, "totalCopies">>
export type CategoryStat = {
  category: Category
  titles: number
  totalCopies: number
  copiesLeft: number
  onLoan: number
}
export type Page<T> = {
  items: T[]
  page: number
  totalPages: number
  total: number
}

export function isOk<T>(result: ApiResult<T>): result is { ok: true; data: T } {
  return result.ok
}

export function isErr<T>(
  result: ApiResult<T>
): result is { ok: false; error: string } {
  return !result.ok
}

export function isFilterCategory(value: unknown): value is FilterCategory {
  return value === "all" || CATEGORIES.some((category) => category === value)
}
