"use client"

import { useTransition } from "react"

import { Button } from "@workspace/ui/components/button"

import { signOutAction } from "../actions"

export function SignOutButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      size="lg"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
