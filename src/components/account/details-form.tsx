"use client"

import { useActionState, useEffect, useRef, type ReactNode } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { updateDetails } from "@/lib/auth-actions"

// Your name and email on the passport's photo page, filled in with what the API has now, and
// saved by updateDetails. Built like the signup form (signup-form.tsx): Zod's messages under the
// fields, the API's answer in a box, and the cursor on the first field to fix.
// children: printed between the fields and the button (the passport's "Role" line).
export function DetailsForm({
  name,
  email,
  children,
}: {
  name: string
  email: string
  children?: ReactNode
}) {
  const [state, formAction, pending] = useActionState(updateDetails, {})
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const fix = state.errors ? "[aria-invalid=true]" : state.message ? "[name=name]" : null
    if (fix) form.current?.querySelector<HTMLInputElement>(fix)?.focus()
  }, [state])

  return (
    <form ref={form} action={formAction} noValidate className="flex flex-col gap-4">
      {/* key: a new element each try, so the same message is read out again */}
      {state.message && (
        <p
          key={state.tries}
          role="alert"
          className="rounded-xl border-l-4 border-destructive bg-destructive-soft px-4 py-3 font-medium"
        >
          {state.message}
        </p>
      )}
      {/* After a failed try: what you typed. Otherwise: what the API has (after a save, the
          page re-renders with the saved values). */}
      <Field
        look="passport"
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state.name ?? name}
        error={state.errors?.name?.[0]}
      />
      <Field
        look="passport"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email ?? email}
        error={state.errors?.email?.[0]}
      />
      {children}
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {/* role="status": screen readers say it without moving the cursor */}
        {state.saved && (
          <p key={state.tries} role="status" className="font-semibold text-success">
            Saved.
          </p>
        )}
      </div>
    </form>
  )
}
