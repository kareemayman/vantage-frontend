"use client"

import { useActionState, useEffect, useId, useRef } from "react"
import { Button } from "@/components/button"
import { deleteAccount } from "@/lib/auth-actions"
import { useWaiting } from "@/lib/waiting"

// "Delete my account", with an "are you sure?" box first. The box is a native <dialog>:
// dialog.showModal() opens it on top of the page, and the browser does the rest. The page behind
// can't be clicked or tabbed to, Esc closes it, focus moves inside (to autoFocus: the safe
// choice), and goes back to the button that opened it when it closes. Like the navbar's
// popovers, but modal: you must answer before doing anything else.
export function DeleteAccount() {
  const [state, formAction, pending] = useActionState(deleteAccount, {})
  useWaiting(pending) // a long wait opens the waiting room (waiting-room.tsx)
  const dialog = useRef<HTMLDialogElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  // After a try that failed, put the cursor back on "Yes, delete it", ready to try again. The
  // button was disabled while it waited, and a disabled button drops the focus.
  useEffect(() => {
    if (state.message) confirm.current?.focus()
  }, [state])

  // Close it when the page is hidden. Next keeps the page alive (hidden) after you leave, and a
  // modal dialog left open there would still block clicks on every other page.
  useEffect(() => {
    const box = dialog.current
    return () => box?.close()
  }, [])

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => dialog.current?.showModal()}>
        Delete my account
      </Button>

      {/* No display class (flex, grid) on the <dialog> itself: it would show the box while it's
          closed, like a popover. The layout goes on the div inside. backdrop: styles the dimmed
          page behind it. */}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border-2 border-outline bg-card p-0 text-foreground shadow-xl backdrop:bg-overlay"
      >
        <div className="flex flex-col gap-4 p-6">
          <h3 id={titleId} className="font-display text-2xl font-bold tracking-tight uppercase">
            Delete your account?
          </h3>
          <p className="text-pretty">You&apos;ll be logged out, and you can&apos;t undo this.</p>
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
          <form action={formAction} className="flex flex-wrap justify-end gap-3">
            {/* autoFocus: the cursor starts on the safe choice */}
            <Button
              variant="outline"
              size="sm"
              autoFocus
              disabled={pending}
              onClick={() => dialog.current?.close()}
            >
              Keep my account
            </Button>
            <Button ref={confirm} type="submit" variant="destructive" size="sm" disabled={pending}>
              {pending ? "Deleting…" : "Yes, delete it"}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  )
}
