import { mkdirSync } from "node:fs"

import { expect, test as setup } from "@playwright/test"

// Names are built, not literal: these are test-only variables, not inputs of any turbo task.
const env = (name: string) => process.env[name]

const accounts = (["editor", "admin"] as const).map((role) => ({
  role,
  email: env(`E2E_${role.toUpperCase()}_EMAIL`),
  password: env(`E2E_${role.toUpperCase()}_PASSWORD`),
  file: `e2e/.auth/${role}.json`,
}))

mkdirSync("e2e/.auth", { recursive: true })

for (const account of accounts) {
  setup(`sign in as ${account.role}`, async ({ page }) => {
    setup.skip(
      !account.email || !account.password,
      `E2E_${account.role.toUpperCase()}_EMAIL / _PASSWORD are not set (apps/admin/.env.local); signed-in specs are skipped`
    )

    await page.goto("/sign-in")
    await page.getByLabel("Email").fill(account.email!)
    await page.getByLabel("Password").fill(account.password!)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).not.toHaveURL(/\/sign-in/)
    await page.context().storageState({ path: account.file })
  })
}
