"use client"

import { useActionState, useEffect, useId, useRef, type ComponentProps } from "react"
import { Button } from "@/components/button"
import { logIn } from "@/lib/auth-actions"

// The login form. useActionState is like useState whose updates come from a Server Action:
// sending the form runs logIn on the server, and whatever logIn returns becomes `state`.
// `pending` is true while it runs. On success, logIn redirects instead of returning.
// noValidate: the browser skips its own checks (its bubbles), so every problem shows the same
// way: Zod's message, under its field.
export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, {})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // After a failed try, put the cursor where the fix goes: the first field with a problem, or
  // the password when the API said no (React has emptied it, ready to type again)
  useEffect(() => {
    if (state.errors?.email) emailRef.current?.focus()
    else if (state.errors?.password || state.message) passwordRef.current?.focus()
  }, [state])

  return (
    <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
      {/* The API's answer, for the whole form. role="alert": screen readers read it out as
          soon as it shows. key: a new element each try, so the same message is read again. */}
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
        ref={emailRef}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={state.errors?.email?.[0]}
      />
      <Field
        ref={passwordRef}
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password?.[0]}
      />
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}

// A labeled input with its error message under it. useId gives each field a unique id: Next
// keeps recently visited pages in the document (hidden), so a plain id="email" could clash with
// another page's. aria-invalid and aria-describedby let screen readers say the field has a
// problem, and read the message with it.
function Field({
  label,
  error,
  ...input
}: ComponentProps<"input"> & { label: string; error?: string }) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 block h-12 w-full rounded-xl border-2 border-input bg-card px-4 aria-invalid:border-destructive"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
