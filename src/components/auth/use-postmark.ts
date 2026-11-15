import { useRouter } from "next/navigation"
import { type RefObject, startTransition, useEffect, useState } from "react"
import { prefersReducedMotion } from "@/lib/motion"

// How long the landed postmark stays in view before the page moves on, in ms
const BEAT = 300

// The postcard forms' last step (login and signup), after a try that worked. Their actions
// answer { ok: true } instead of redirecting, because a redirect from the server would leave
// before the postmark lands. Then:
// 1. this returns true (sent), so the form marks itself data-sent, and the card's postmark
//    thunks onto the stamp (the sent: variant in globals.css; with reduced motion it just
//    appears);
// 2. it loads the homepage while it waits for the postmark to land, plus a beat to see it;
// 3. it goes home.
export function usePostmark(state: { ok?: boolean }, form: RefObject<HTMLFormElement | null>) {
  const router = useRouter()

  // The success we've already gone home after. Next keeps a page you leave alive, hidden, with
  // its state, so without this, coming back (say, to log in again after logging out) would find
  // the old success: a stamped card, a button you can't press, and another trip home.
  const [done, setDone] = useState<object>()
  const sent = state.ok === true && state !== done

  useEffect(() => {
    if (!sent) return
    let left = false // the page was hidden (or closed) before it was time to go
    const postmark = form.current?.closest("[data-postcard]")?.querySelector("[data-postmark]")

    // Start loading the homepage now, while the postmark lands, so the page changes right on
    // the beat instead of a network wait later (production only: next dev doesn't prefetch)
    router.prefetch("/")

    // On a phone, the stamp may have scrolled out of view while you filled in the form: bring
    // it back. scrollIntoView keeps the room under the navbar (scroll-pt on <html>).
    postmark?.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    })

    // getAnimations: the CSS animations playing on it and inside it right now (none with
    // reduced motion). Each one's .finished is a promise that settles when it ends.
    const landing = postmark?.getAnimations({ subtree: true }).map((a) => a.finished) ?? []
    Promise.allSettled(landing)
      .then(() => new Promise((resolve) => setTimeout(resolve, BEAT)))
      .then(() => {
        if (left) return
        // One transition: React holds setDone back until the homepage is showing, so the card
        // stays stamped to the end
        startTransition(() => {
          router.push("/")
          setDone(state)
        })
      })

    return () => {
      left = true
    }
  }, [sent, state, form, router])

  return sent
}
