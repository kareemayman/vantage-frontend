import { useEffect, useSyncExternalStore } from "react"

// What's waiting for the server right now, for the waiting room (src/components/waiting-room.tsx),
// which opens when a wait goes on for a few seconds (the API waking up on Render).
//
// A tiny store, like a Redux store without the library: a value (when the current wait began),
// a way to change it (start, and the "done" function it hands back), and listeners that hear
// about each change. React reads it with useSyncExternalStore, its hook for any outside store.
//
// It only lives in the browser: the server renders "nothing is waiting" (getServerSnapshot),
// and only effects change it, so it's never shared between visitors on the server.

let count = 0 // how many things are waiting right now (two forms could wait at once)
let since: number | null = null // when the wait began; null while nothing waits
const listeners = new Set<() => void>() // who wants to hear when `since` changes (the room)

const tellListeners = () => listeners.forEach((listen) => listen())

// Something starts waiting. It gets back a "done" function to call when its wait is over.
function start() {
  count++
  // The first thing waiting starts the clock. A second one joining in doesn't restart it.
  if (count === 1) {
    since = Date.now()
    tellListeners()
  }

  let done = false
  return () => {
    if (done) return // already said it's done: don't count it twice
    done = true
    count--
    // The last thing waiting is done: the wait is over
    if (count === 0) {
      since = null
      tellListeners()
    }
  }
}

// Say you're waiting while `waiting` is true: a form while its action runs (useActionState's
// `pending`), a page part while it loads. Cleaning up the effect says it's done, so a form that
// goes away mid-wait (you left the page) doesn't keep the room open.
export function useWaiting(waiting: boolean) {
  useEffect(() => (waiting ? start() : undefined), [waiting])
}

// Loading notes that came with the page from the server: a direct visit to /account while the
// API is slow. React leaves a <Suspense> part that's still loading as plain HTML until its
// content arrives, so the note's own effect (<Waiting>) never runs. The room calls this once, as
// the page starts, to find those notes by their mark (data-loading-note), and counts them as
// waiting until none are showing: React swaps them for the content, or you go to another page,
// which hides them. A MutationObserver hears about every element added to or removed from the
// page.
export function useNotesFromServer() {
  useEffect(() => {
    const notes = [...document.querySelectorAll("[data-loading-note]")]
    const showing = () => notes.some((note) => note.isConnected && note.checkVisibility())
    if (!showing()) return
    const done = start()
    const watch = new MutationObserver(() => {
      if (showing()) return
      watch.disconnect()
      done()
    })
    watch.observe(document.body, { childList: true, subtree: true })
    return () => {
      watch.disconnect()
      done()
    }
  }, [])
}

// When the current wait began (Date.now() time), or null
export function useWaitingSince() {
  return useSyncExternalStore(
    subscribe,
    () => since,
    () => null,
  )
}

// Call `listen` the moment the current wait ends, before React re-renders anything. The room
// closes itself with it: a form's effects run right after its wait ends (the cursor goes to the
// field to fix), and they can't reach the page while the room still covers it. Returns a
// function that stops listening.
export function onWaitEnd(listen: () => void) {
  return subscribe(() => {
    if (since === null) listen()
  })
}

function subscribe(listen: () => void) {
  listeners.add(listen)
  return () => {
    listeners.delete(listen)
  }
}
