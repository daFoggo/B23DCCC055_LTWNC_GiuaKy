import { expect, test } from "@playwright/test"

test("signed-out visitors are sent to sign-in", async ({ page }) => {
  for (const path of ["/", "/pending-access"]) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/sign-in$/)
  }
})

test("sign-in page renders the form and is not indexed", async ({ page }) => {
  await page.goto("/sign-in")
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
})

test("sign-up page renders the form", async ({ page }) => {
  await page.goto("/sign-up")
  await expect(page.getByRole("heading", { name: "Create a staff account" })).toBeVisible()
})

test("no horizontal scroll on the sign-in page at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/sign-in")
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
