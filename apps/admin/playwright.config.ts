import { existsSync } from "node:fs"

import { defineConfig, devices } from "@playwright/test"

// Playwright does not read Next's env files; E2E_* credentials live in .env.local.
try {
  process.loadEnvFile(".env.local")
} catch {
  // No .env.local: signed-in specs skip with a reason.
}

const EDITOR_STATE = "e2e/.auth/editor.json"

const baseURL = process.env.BASE_URL || "http://localhost:3001"
const signedIn = (state: string) =>
  existsSync(state) ? { storageState: state } : {}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: "auth.setup.ts" },
    {
      name: "phone",
      testIgnore: ["smoke.spec.ts", "auth.setup.ts"],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        hasTouch: true,
        ...signedIn(EDITOR_STATE),
      },
    },
    {
      name: "desktop",
      testIgnore: ["smoke.spec.ts", "auth.setup.ts"],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        ...signedIn(EDITOR_STATE),
      },
    },
    {
      name: "chromium",
      testMatch: "smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
