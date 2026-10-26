import { describe, expect, it } from "vitest"

import { notStubbed } from "../action-result"
import { toastPayload } from "../notify"

describe("toastPayload", () => {
  it("reports a saved result as a success", () => {
    const payload = toastPayload({ ok: true, savedAt: "2026-10-24T10:42:00Z" }, "Saved")
    expect(payload.type).toBe("success")
    expect(payload.title).toBe("Saved")
  })

  it("never hides a failure: the reason is the description", async () => {
    const payload = toastPayload(await notStubbed(), "Saved")
    expect(payload.type).toBe("error")
    expect(payload.description).toBe("Not wired")
    expect(payload.title).not.toBe("Saved")
  })
})
