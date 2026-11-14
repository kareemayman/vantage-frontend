"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { signUp } from "@/lib/auth-actions"

// The signup form, built like the login form (login-form.tsx explains useActionState): send it,
// signUp runs on the server, and whatever it returns becomes `state`; on success it redirects.
export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, {})
  const form = useRef<HTMLFormElement>(null)

  // After a failed try, put the cursor where the fix goes: the first field marked invalid, or
  // the password when the server couldn't be reached (React has emptied both passwords)
  useEffect(() => {
    const fix = state.errors ? "[aria-invalid=true]" : state.message ? "[name=password]" : null
    if (fix) form.current?.querySelector<HTMLInputElement>(fix)?.focus()
  }, [state])

  return (
    <form ref={form} action={formAction} noValidate className="mt-8 flex flex-col gap-5">
      {/* Problems that aren't about one field. key: a new element each try, so the same
          message is read out again. */}
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
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state.name}
        error={state.errors?.name?.[0]}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={state.errors?.email?.[0]}
      />
      {/* new-password: tells password managers to offer a new, strong password */}
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={state.errors?.password?.[0]}
      />
      <Field
        label="Confirm password"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors?.passwordConfirm?.[0]}
      />
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  )
}
