/** Result of a save/submit handler. Stubs return `notStubbed()` until the logic agent wires the real call. */
export type ActionResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: string }

export async function notStubbed(): Promise<ActionResult> {
  return { ok: false, error: "Not wired" }
}
