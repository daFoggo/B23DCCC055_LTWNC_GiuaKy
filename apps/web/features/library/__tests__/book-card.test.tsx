// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BookCard } from "../components/book-card"
import type { BookCardData } from "../types"

const book: BookCardData = {
  id: "b1",
  title: "Lập trình Web",
  author: "Nguyễn Văn A",
  category: "CNTT",
  year: 2021,
  copiesLeft: 2,
}

describe("BookCard", () => {
  afterEach(cleanup)

  it("shows title, author, category, year and copies left", () => {
    render(<BookCard book={book} borrowed={false} onBorrow={vi.fn()} />)
    expect(screen.getByText("Lập trình Web")).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument()
    expect(screen.getByText("CNTT")).toBeInTheDocument()
    expect(screen.getByText("2021")).toBeInTheDocument()
    expect(screen.getByText("Còn 2 cuốn")).toBeInTheDocument()
  })

  it("shows copies as left/total and a sold-out state", () => {
    const { rerender } = render(
      <BookCard
        book={{ ...book, totalCopies: 5 }}
        borrowed={false}
        onBorrow={vi.fn()}
      />
    )
    expect(screen.getByText("Còn 2/5 cuốn")).toBeInTheDocument()
    rerender(
      <BookCard
        book={{ ...book, copiesLeft: 0, totalCopies: 5 }}
        borrowed={false}
        onBorrow={vi.fn()}
      />
    )
    expect(screen.getByText("Đã hết")).toBeInTheDocument()
  })

  it("shows Trả for a borrowed book and calls onReturn with the id", async () => {
    const user = userEvent.setup()
    const onReturn = vi.fn()
    render(
      <BookCard book={book} borrowed onBorrow={vi.fn()} onReturn={onReturn} />
    )
    await user.click(screen.getByRole("button", { name: "Trả" }))
    expect(onReturn).toHaveBeenCalledWith("b1")
  })

  it("clicking Mượn calls onBorrow with the book id", async () => {
    const user = userEvent.setup()
    const onBorrow = vi.fn()
    render(<BookCard book={book} borrowed={false} onBorrow={onBorrow} />)
    await user.click(screen.getByRole("button", { name: "Mượn" }))
    expect(onBorrow).toHaveBeenCalledWith("b1")
  })

  it("disables Mượn when no copies are left", () => {
    render(
      <BookCard
        book={{ ...book, copiesLeft: 0 }}
        borrowed={false}
        onBorrow={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: "Hết sách" })).toBeDisabled()
  })

  it("opens the detail from the title button with the book id", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <BookCard
        book={book}
        borrowed={false}
        onBorrow={vi.fn()}
        onOpen={onOpen}
      />
    )
    await user.click(
      screen.getByRole("button", { name: "Xem chi tiết Lập trình Web" })
    )
    expect(onOpen).toHaveBeenCalledWith("b1")
  })
})
