import type { Metadata } from "next"

import { StaffPage } from "@/app/(shell)/_components/staff-page"

export const metadata: Metadata = { title: "Dashboard" }

export default function Page() {
  return (
    <StaffPage
      title="Dashboard"
      description="Start here: add your own sections and screens."
    />
  )
}
