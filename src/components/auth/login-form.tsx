"use client"

import Link from "next/link"
import { useActionState, useEffect, useRef } from "react"
import { usePostmark } from "@/components/auth/use-postmark"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { logIn } from "@/lib/auth-actions"
import { useWaiting } from "@/lib/waiting"

// The login form. useActionState is like useState whose updates come from a Server Action:
// sending the form runs logIn on the server, and whatever logIn returns becomes `state`.
// `pending` is true while it runs. On success, logIn answers { ok: true }, and usePostmark
// stamps the postcard, then goes on (home, or back where you were going); `sent` is true
// meanwhile.
// noValidate: the browser skips its own checks (its bubbles), so every problem shows the same
// way: Zod's message, under its field.
export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, {})
  useWaiting(pending) // a long wait opens the waiting room (waiting-room.tsx)
  const form = useRef<HTMLFormElement>(null)
  const sent = usePostmark(state, form)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // After a failed try, put the cursor where the fix goes: the first field with a problem, or
  // the password when the API said no (React has emptied it, ready to type again)
  useEffect(() => {
    if (state.errors?.email) emailRef.current?.focus()
    else if (state.errors?.password || state.message) passwordRef.current?.focus()
  }, [state])

  return (
    // data-sent: the postmark lands (sent: in globals.css). `|| undefined`: React would write a
    // plain false as data-sent="false", which still counts as there.
    <form
      ref={form}
      action={formAction}
      noValidate
      data-sent={sent || undefined}
      className="flex flex-col gap-5"
    >
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
        look="line"
        ref={emailRef}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={state.errors?.email?.[0]}
      />
      <Field
        look="line"
        ref={passwordRef}
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password?.[0]}
      />
      {/* Under the password, where you'd look when it's the one you've forgotten. -mt-2 pulls it
          closer to the field it's about. */}
      <Link
        href="/forgot-password"
        className="-mt-2 self-end text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Forgot your password?
      </Link>
      <Button type="submit" disabled={pending || sent} className="mt-2 w-full">
        {pending || sent ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}
