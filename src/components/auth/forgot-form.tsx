"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { requestReset } from "@/lib/auth-actions"

// The "Forgot your password?" form: your email, and "Email me a link". Like the login form, it
// sends a Server Action (requestReset) through useActionState. Once the email has gone out, the
// action answers { sent: true }: the postmark thunks onto the card's stamp (data-sent, the sent:
// variant in globals.css), and the form gives way to a note saying where the email went. Unlike
// login, the page stays: there's nowhere to go until the email arrives.
export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestReset, {})
  // The note you closed with "try again" (to fix the address, or send it once more). The action's
  // state stays { sent: true } until the next try, so this remembers which one you've moved on
  // from (like `done` in usePostmark).
  const [closed, setClosed] = useState<object>()
  const sent = state.sent === true && state !== closed
  const emailRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)

  // Where the cursor goes after each change: to the note once it's sent (the button it was on is
  // gone, and a screen reader reads the note out when it gets the focus), and to the email when
  // there's something to fix or you've chosen "try again"
  useEffect(() => {
    if (sent) noteRef.current?.focus()
    else if (state.errors?.email || state === closed) emailRef.current?.focus()
  }, [state, sent, closed])

  return (
    // data-sent: the postmark lands. `|| undefined`: React would write a plain false as
    // data-sent="false", which still counts as there.
    <div data-sent={sent || undefined}>
      {sent ? (
        // tabIndex={-1}: the note can take the focus from the code above, but isn't a Tab stop
        <div ref={noteRef} tabIndex={-1} className="outline-none">
          <p className="font-display text-2xl font-bold tracking-tight uppercase">
            Check your email
          </p>
          {/* The same words whether or not the address has an account (requestReset says why).
              wrap-anywhere: an email has no spaces, so a long one could run off the card. */}
          <p className="mt-2 text-pretty">
            If <strong className="font-semibold wrap-anywhere">{state.email}</strong> has an
            account, a link to pick a new password is on its way. It works for 10 minutes.
          </p>
          <p className="mt-4 text-pretty text-muted-foreground">
            Didn&apos;t get it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setClosed(state)}
              className="font-semibold text-primary underline underline-offset-4"
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <form action={formAction} noValidate className="flex flex-col gap-5">
          {/* The API's answer, for the whole form (like the login form's) */}
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
          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Sending…" : "Email me a link"}
          </Button>
        </form>
      )}
    </div>
  )
}
