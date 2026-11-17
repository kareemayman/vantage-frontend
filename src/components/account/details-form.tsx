"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { updateDetails } from "@/lib/auth-actions"

// Your name and email on the account page, filled in with what the API has now, and saved by
// updateDetails. Built like the signup form (signup-form.tsx): Zod's messages under the fields,
// the API's answer in a box, and the cursor on the first field to fix.
export function DetailsForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateDetails, {})
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const fix = state.errors ? "[aria-invalid=true]" : state.message ? "[name=name]" : null
    if (fix) form.current?.querySelector<HTMLInputElement>(fix)?.focus()
  }, [state])

  return (
    <form ref={form} action={formAction} noValidate className="flex max-w-md flex-col gap-5">
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
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state.name ?? name}
        error={state.errors?.name?.[0]}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email ?? email}
        error={state.errors?.email?.[0]}
      />
      <div className="flex items-center gap-4">
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
