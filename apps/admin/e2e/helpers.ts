import { existsSync } from "node:fs"

import { expect, test, type Page } from "@playwright/test"

export const EDITOR_STATE = "e2e/.auth/editor.json"
export const ADMIN_STATE = "e2e/.auth/admin.json"

/** Skips the current spec file's tests unless the setup project saved a session for that role. */
export function requireSession(state: string, role: string) {
  test.skip(
    !existsSync(state),
    `No saved ${role} session: set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD in apps/admin/.env.local`
  )
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0)
}

/** Every visible button and link-like control is at least 44px tall (WCAG touch target, A9). */
export async function expectTouchTargets(page: Page, selector = "main button, main a[href]") {
  const small = await page.evaluate((sel) => {
    return [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && style.visibility !== "hidden"
      })
      .filter((el) => el.getBoundingClientRect().height < 44)
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}"`)
  }, selector)
  expect(small, "controls under 44px").toEqual([])
}

/** Collects console errors; assert on the returned array at the end of the test. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))
  return errors
}
