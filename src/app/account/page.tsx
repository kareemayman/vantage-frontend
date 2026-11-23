import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { DeleteAccount } from "@/components/account/delete-account"
import { Passport } from "@/components/account/passport"
import { Button } from "@/components/button"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { ApiError, getMe } from "@/lib/api"
import { logInAgain, logOut } from "@/lib/auth-actions"
import { getSession } from "@/lib/session"
import type { User } from "@/lib/users"

export const metadata: Metadata = {
  title: "Your account", // -> "Your account | Vantage"
  robots: { index: false }, // one person's page: search engines shouldn't list it
}

// Your account: your passport (src/components/account/passport.tsx), with a greeting and "Log
// out" above it and "Delete your account" below. The title is built ahead of time, like any
// page; everything about you streams in per request, behind <Suspense>, because it reads your
// session cookie.
// lg:pr-16: room on the right for the passport's "trips" tab, which sticks out of its cover.
// max-lg:overflow-x-clip: as the passport opens, its cover swings toward you and grows past the
// screen's right edge for a moment, which made tablets scroll sideways.
export default function AccountPage() {
  return (
    <>
      <section
        aria-labelledby="account-title"
        className="mx-auto max-w-6xl px-6 pt-28 pb-24 max-lg:overflow-x-clip md:pt-36 lg:pr-16"
      >
        <h1
          id="account-title"
          className="font-display text-[2.625rem] leading-none font-bold tracking-tight uppercase md:text-5xl lg:text-6xl"
        >
          Your account
        </h1>
        {/* The note is a screen tall, so the footer stays below the fold while it shows. Any
            shorter, and the footer would jump down as the passport arrives. */}
        <Suspense
          fallback={<p className="mt-6 min-h-svh text-muted-foreground">Loading your account…</p>}
        >
          <AccountDetails />
        </Suspense>
      </section>
      <PauseOffscreen />
    </>
  )
}

// You, as the API knows you. The navbar only trusts the cookie; this asks the API, which checks
// the token itself.
async function AccountDetails() {
  const session = await getSession()
  // Logged out: off to log in, and back here afterward. proxy.ts already sends anyone without
  // the cookie there before the page renders; this catches a cookie that's there but broken (an
  // older format, or edited by hand). redirect() never returns, so below this, TypeScript knows
  // `session` isn't null.
  if (!session) redirect("/login?next=/account")

  let user: User
  try {
    user = await getMe(session.token)
  } catch (error) {
    // The API turned the token down: you changed your password on another device, or the
    // account was deleted
    if (error instanceof ApiError && error.status === 401) return <LoginEnded />
    console.error(error) // anything else is unexpected: keep the details in the server's log
    return (
      <p className="mt-6">
        We can&apos;t load your account right now. Please try again in a minute.
      </p>
    )
  }

  // Your first name, lowercase like every handwritten note ("Lourdes Browning" → "lourdes")
  const first = user.name.split(" ")[0].toLowerCase()

  return (
    <>
      {/* A greeting under the title, which writes itself in as the page appears (write, like
          the journal's handwriting), and "Log out": a plain form, like the account menu's, so it
          works even before the page's JavaScript */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="inline-block -rotate-2 font-hand text-[1.75rem] text-primary motion-safe:animate-write">
          hi, {first}!
        </p>
        <form action={logOut}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      <Passport user={user} />

      {/* Last on the page, away from everyday buttons: the one you can't take back */}
      <section
        aria-labelledby="delete-title"
        className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl border-2 border-dashed border-border px-6 py-5"
      >
        <div>
          <h2
            id="delete-title"
            className="font-display text-2xl font-bold tracking-tight uppercase"
          >
            Delete your account
          </h2>
          <p className="mt-1 text-pretty text-muted-foreground">
            This logs you out and removes your account. You can&apos;t undo it.
          </p>
        </div>
        <DeleteAccount />
      </section>
    </>
  )
}

// When the API turns the session down. The cookie is no use anymore, but a page can't delete
// cookies (only a Server Action can), so the button does it, then goes to the login page.
function LoginEnded() {
  return (
    <div className="mt-6 max-w-md">
      <p>Your login has ended, so we can&apos;t show your account. Please log in again.</p>
      <form action={logInAgain} className="mt-4">
        <Button type="submit" size="sm">
          Log in again
        </Button>
      </form>
    </div>
  )
}
