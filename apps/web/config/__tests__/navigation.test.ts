import { describe, expect, it } from "vitest"

import { breadcrumbTrail, DASHBOARD_NAV } from "../navigation"

const labels = (path: string) =>
  breadcrumbTrail(path, DASHBOARD_NAV).map((crumb) => crumb.label)

describe("breadcrumbTrail", () => {
  it("appends the title on an index page", () => {
    expect(labels("/dashboard")).toEqual(["dashboard", "thư viện"])
  })

  it("does not repeat the title after a leaf nav link", () => {
    expect(labels("/dashboard/stats")).toEqual(["dashboard", "stats"])
  })
})
