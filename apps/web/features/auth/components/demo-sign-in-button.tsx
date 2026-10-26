"use client"

import { useActionState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { demoSignInAction } from "../actions"
import { FormError } from "./form-error"

export function DemoSignInButton() {
  const [state, formAction, pending] = useActionState(demoSignInAction, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? <Spinner className="mr-2" /> : null}
        Demo login
      </Button>
    </form>
  )
}
