"use client"

import { useActionState, useEffect, useRef } from "react"
import { usePostmark } from "@/components/auth/use-postmark"
import { Button, ButtonLink } from "@/components/button"
import { Field } from "@/components/field"
import { resetPassword } from "@/lib/auth-actions"

// The reset page's form: the new password twice, sent with the email link's token (from the
// page's address, in a hidden field). Like login: resetPassword answers { ok: true } once you're
// logged in, and usePostmark stamps the postcard, then goes home. When the link no longer works,
// the form gives way to a note with a way to get a new one.
// `token` is empty in the page's fallback, which is only there for the moment before the address
// is read (see the page).
export function ResetForm({ token = "" }: { token?: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, {})
  const form = useRef<HTMLFormElement>(null)
  const sent = usePostmark(state, form)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)

  // After a try, the cursor goes where the fix is: the first field with a problem, the new
  // password when the API said no (React has emptied both), or the note when the link is too old
  useEffect(() => {
    if (state.expired) noteRef.current?.focus()
    else if (state.errors?.password || state.message) passwordRef.current?.focus()
    else if (state.errors?.passwordConfirm) confirmRef.current?.focus()
  }, [state])

  if (state.expired) {
    return (
      // tabIndex={-1}: the note can take the focus from the code above, but isn't a Tab stop
      <div ref={noteRef} tabIndex={-1} className="outline-none">
        <p className="font-display text-2xl font-bold tracking-tight uppercase">
          This link has expired
        </p>
        <p className="mt-2 text-pretty">Reset links work for 10 minutes, and only once.</p>
        <ButtonLink href="/forgot-password" className="mt-6 w-full">
          Email me a new link
        </ButtonLink>
      </div>
    )
  }

  return (
    // data-sent: the postmark lands (see the login form)
    <form
      ref={form}
      action={formAction}
      noValidate
      data-sent={sent || undefined}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="token" defaultValue={token} />
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
        ref={passwordRef}
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={state.errors?.password?.[0]}
      />
      <Field
        look="line"
        ref={confirmRef}
        label="Confirm new password"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors?.passwordConfirm?.[0]}
      />
      <Button type="submit" disabled={pending || sent} className="mt-2 w-full">
        {pending || sent ? "Saving…" : "Save and log in"}
      </Button>
    </form>
  )
}
