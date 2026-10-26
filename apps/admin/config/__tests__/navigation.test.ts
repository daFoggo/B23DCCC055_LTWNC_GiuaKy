import { describe, expect, it } from "vitest"

import { NAV_SECTIONS, visibleSections } from "../navigation"

describe("visibleSections", () => {
  it("shows the overview to editors and admins", () => {
    expect(visibleSections("editor").map((s) => s.title)).toEqual(["Overview"])
    expect(visibleSections("admin").map((s) => s.title)).toEqual(["Overview"])
  })

  it("shows nothing to customers", () => {
    expect(visibleSections("customer")).toEqual([])
  })
})

describe("NAV_SECTIONS", () => {
  it("links every route exactly once", () => {
    const hrefs = NAV_SECTIONS.flatMap((s) => s.links.map((l) => l.href))
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})
