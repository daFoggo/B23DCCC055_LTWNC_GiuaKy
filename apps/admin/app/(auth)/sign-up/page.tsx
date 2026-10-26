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
        <AuthPitch title="Join the staff.">
          Create an account, then an administrator grants you access.
        </AuthPitch>
        <Terminal title="base staff">
          <TerminalCommand step={0}>invite</TerminalCommand>
          <TerminalOutput step={1} label="account" tone="muted">
            create
          </TerminalOutput>
          <TerminalOutput step={2} label="access" tone="muted">
            granted by an admin
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
        <AuthHeading eyebrow="Admin" title="Create a staff account">
          After signing up, an administrator must grant you access before you can enter.
        </AuthHeading>
        <SignUpForm />
      </AuthBody>
      </AuthMain>
    </>
  )
}
