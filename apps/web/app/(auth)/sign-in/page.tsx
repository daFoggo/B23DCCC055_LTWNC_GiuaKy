import type { Metadata } from "next"
import { Suspense } from "react"

import { SIGN_UP_PATH } from "@/config/routes"
import { FormError } from "@/features/auth/components/form-error"
import { SignInForm } from "@/features/auth/components/sign-in-form"

import {
  AuthAside,
  AuthBody,
  AuthHeader,
  AuthHeading,
  AuthMain,
  AuthPitch,
  AuthSwitch,
} from "../_components/auth-frame"
import {
  Terminal,
  TerminalCommand,
  TerminalOutput,
  TerminalPrompt,
} from "../_components/terminal"

export const metadata: Metadata = { title: "Sign in" }

async function OAuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  if (!error) return null
  return (
    <FormError message="Sign-in with the provider failed. Please try again." />
  )
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <>
      <AuthAside>
        <AuthPitch title="Pick up where you left off.">
          Your workspace is one sign-in away.
        </AuthPitch>
        <Terminal title="base status">
          <TerminalCommand step={0}>status</TerminalCommand>
          <TerminalOutput step={1} label="auth" tone="ok">
            provider ready
          </TerminalOutput>
          <TerminalOutput step={2} label="data" tone="muted">
            connected
          </TerminalOutput>
          <TerminalOutput step={3} label="session" tone="focus">
            waiting for you
          </TerminalOutput>
          <TerminalPrompt step={4} />
        </Terminal>
      </AuthAside>
      <AuthMain>
        <AuthHeader>
          <AuthSwitch prompt="No account?" href={SIGN_UP_PATH}>
            Sign up
          </AuthSwitch>
        </AuthHeader>
        <AuthBody>
          <AuthHeading eyebrow="Sign in" title="Welcome back">
            Sign in to your account.
          </AuthHeading>
          <div className="flex flex-col gap-4">
            <Suspense>
              <OAuthError searchParams={searchParams} />
            </Suspense>
            <SignInForm />
            {/* Google is disabled; enable the provider in Supabase, then render `<GoogleSignInButton />`. */}
          </div>
        </AuthBody>
      </AuthMain>
    </>
  )
}
