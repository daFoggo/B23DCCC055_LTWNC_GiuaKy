"use server"

import { redirect } from "next/navigation"

import { SignInSchema, SignUpSchema } from "@workspace/auth/schemas"

import { getErrorMessage } from "@workspace/db/errors"

import { HOME_PATH, SIGN_IN_PATH } from "@/config/routes"
import { getAuthProvider, type SignUpResult } from "@/lib/auth"

/** `values` echoes non-secret fields back: React resets the form after an action finishes. */
export type SignInState = { error?: string; values?: { email: string } }
export type SignUpState = {
  error?: string
  confirmEmail?: boolean
  values?: { name: string; email: string }
}

export async function signInAction(
  _previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  const values = { email: String(formData.get("email") ?? "") }
  const parsed = SignInSchema.safeParse({
    email: values.email,
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid data",
      values,
    }
  }

  const provider = await getAuthProvider()
  try {
    await provider.signIn(parsed.data)
  } catch (error) {
    if (!provider.isExpectedError(error)) {
      console.error("[signInAction] unexpected error:", error)
      return {
        error: "Could not reach the sign-in server. Please try again later.",
        values,
      }
    }
    return { error: getErrorMessage(error, "Could not sign in"), values }
  }

  // redirect() throws, so it must stay outside the try/catch.
  redirect(HOME_PATH)
}

export async function signUpAction(
  _previous: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  }
  const parsed = SignUpSchema.safeParse({
    ...values,
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid data",
      values,
    }
  }

  const provider = await getAuthProvider()
  let result: SignUpResult
  try {
    result = await provider.signUp(parsed.data)
  } catch (error) {
    if (!provider.isExpectedError(error)) {
      console.error("[signUpAction] unexpected error:", error)
      return {
        error: "Could not reach the sign-in server. Please try again later.",
        values,
      }
    }
    return {
      error: getErrorMessage(error, "Could not create the account"),
      values,
    }
  }

  if (result === "confirm-email") return { confirmEmail: true }
  redirect(HOME_PATH)
}

export async function signOutAction(): Promise<void> {
  const provider = await getAuthProvider()
  await provider.signOut()
  redirect(SIGN_IN_PATH)
}
