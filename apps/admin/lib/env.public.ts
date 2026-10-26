import { z } from "zod"

/**
 * Browser-safe environment. Each `NEXT_PUBLIC_*` variable must be referenced literally
 * (`process.env.NEXT_PUBLIC_X`) so Next.js can inline it at build time.
 */
const publicSchema = z.object({
})

export const publicEnv = publicSchema.parse({
})
