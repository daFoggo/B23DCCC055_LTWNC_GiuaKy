import { describe, expect, it } from "vitest"

import { adminGate } from "../gate"

describe("adminGate", () => {
  it("sends signed-out visitors to sign-in", () => {
    expect(
      adminGate({ pathname: "/san-pham", isAuthenticated: false, role: null })
    ).toBe("/sign-in")
    expect(
      adminGate({ pathname: "/", isAuthenticated: false, role: null })
    ).toBe("/sign-in")
  })

  it("lets signed-out visitors open the auth pages", () => {
    expect(
      adminGate({ pathname: "/sign-in", isAuthenticated: false, role: null })
    ).toBeNull()
    expect(
      adminGate({ pathname: "/sign-up", isAuthenticated: false, role: null })
    ).toBeNull()
  })

  it("parks signed-in customers on the waiting page", () => {
    expect(
      adminGate({
        pathname: "/san-pham",
        isAuthenticated: true,
        role: "customer",
      })
    ).toBe("/pending-access")
    expect(
      adminGate({
        pathname: "/sign-in",
        isAuthenticated: true,
        role: "customer",
      })
    ).toBe("/pending-access")
    expect(
      adminGate({
        pathname: "/pending-access",
        isAuthenticated: true,
        role: "customer",
      })
    ).toBeNull()
  })

  it("sends staff away from auth and waiting pages", () => {
    expect(
      adminGate({
        pathname: "/pending-access",
        isAuthenticated: true,
        role: "editor",
      })
    ).toBe("/")
    expect(
      adminGate({
        pathname: "/sign-in",
        isAuthenticated: true,
        role: "admin",
      })
    ).toBe("/")
    expect(
      adminGate({ pathname: "/sign-up", isAuthenticated: true, role: "editor" })
    ).toBe("/")
  })

  it("lets staff open content pages", () => {
    expect(
      adminGate({
        pathname: "/san-pham",
        isAuthenticated: true,
        role: "editor",
      })
    ).toBeNull()
  })

  it("always lets the expired-session route run", () => {
    expect(
      adminGate({
        pathname: "/auth/expired",
        isAuthenticated: true,
        role: "customer",
      })
    ).toBeNull()
    expect(
      adminGate({
        pathname: "/auth/expired",
        isAuthenticated: false,
        role: null,
      })
    ).toBeNull()
  })

  it("does not treat look-alike paths as public", () => {
    expect(
      adminGate({
        pathname: "/sign-in-gia",
        isAuthenticated: false,
        role: null,
      })
    ).toBe("/sign-in")
  })
})
