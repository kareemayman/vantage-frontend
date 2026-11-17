"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { changePassword } from "@/lib/auth-actions"

// Changing your password on the account page, saved by changePassword. Built like the details
// form (details-form.tsx), but nothing typed comes back after a try: these are passwords.
// `email`: for password managers, below.
export function PasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changePassword, {})
  const form = useRef<HTMLFormElement>(null)

  // After a failed try, put the cursor where the fix goes: the first field with a problem, or
  // the current password when the API said no for another reason (React has emptied them all)
  useEffect(() => {
    const fix = state.errors
      ? "[aria-invalid=true]"
      : state.message
        ? "[name=currentPassword]"
        : null
    if (fix) form.current?.querySelector<HTMLInputElement>(fix)?.focus()
  }, [state])

  return (
    <form ref={form} action={formAction} noValidate className="flex max-w-md flex-col gap-5">
      {/* Password managers save a password for an account, so a change form should say which
          account: a hidden username box (Chrome's advice for change-password forms). No `name`,
          so it isn't sent with the form. */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      {state.message && (
        <p
          key={state.tries}
          role="alert"
          className="rounded-xl border-l-4 border-destructive bg-destructive-soft px-4 py-3 font-medium"
        >
          {state.message}
        </p>
      )}
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        error={state.errors?.currentPassword?.[0]}
      />
      {/* new-password: password managers offer a new, strong one */}
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={state.errors?.password?.[0]}
      />
      <Field
        label="Confirm new password"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors?.passwordConfirm?.[0]}
      />
      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </Button>
        {state.saved && (
          <p key={state.tries} role="status" className="font-semibold text-success">
            Password changed.
          </p>
        )}
      </div>
    </form>
  )
}
