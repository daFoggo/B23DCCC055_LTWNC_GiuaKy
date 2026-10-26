"use client"

import { useEffect } from "react"

import { toast } from "@workspace/ui/components/toast"

import "./warning-toast.css"
import { dismissWarning } from "../store/books-slice"
import { useAppDispatch, useAppSelector } from "../store/hooks"

export function WarningToast() {
  const dispatch = useAppDispatch()
  const warning = useAppSelector((state) => state.books.warning)

  useEffect(() => {
    if (!warning) return
    toast.add({ type: "error", title: warning })
    dispatch(dismissWarning())
  }, [warning, dispatch])

  return null
}
