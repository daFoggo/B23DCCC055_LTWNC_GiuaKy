import type { Metadata } from "next"

import { SIGN_IN_PATH } from "@/config/routes"
import { SignUpForm } from "@/features/auth/components/sign-up-form"

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

export const metadata: Metadata = { title: "Sign up" }

export default function SignUpPage() {
  return (
    <>
      <AuthAside>
        <AuthPitch title="Start from a solid base.">
          Create an account and set up your workspace in a minute.
        </AuthPitch>
        <Terminal title="base init">
          <TerminalCommand step={0}>init</TerminalCommand>
          <TerminalOutput step={1} label="account" tone="muted">
            create
          </TerminalOutput>
          <TerminalOutput step={2} label="email" tone="muted">
            confirm
          </TerminalOutput>
          <TerminalOutput step={3} label="workspace" tone="focus">
            ready
          </TerminalOutput>
          <TerminalPrompt step={4} />
        </Terminal>
      </AuthAside>
      <AuthMain>
        <AuthHeader>
          <AuthSwitch prompt="Already have an account?" href={SIGN_IN_PATH}>
            Sign in
          </AuthSwitch>
        </AuthHeader>
        <AuthBody>
          <AuthHeading eyebrow="Sign up" title="Create an account">
            Create an account to get started.
          </AuthHeading>
          <SignUpForm />
        </AuthBody>
      </AuthMain>
    </>
  )
}
