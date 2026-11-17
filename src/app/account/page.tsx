import type { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { DetailsForm } from "@/components/account/details-form"
import { PasswordForm } from "@/components/account/password-form"
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

// Your account, plain for now (phase 3 step 3a). Its design comes once step 5 adds the settings
// (your name, email and password). The title is built ahead of time, like any page; everything
// about you streams in per request, behind <Suspense>, because it reads your session cookie.
export default function AccountPage() {
  return (
    <>
      <section
        aria-labelledby="account-title"
        className="mx-auto max-w-6xl px-6 pt-28 pb-24 md:pt-36"
      >
        <h1 id="account-title" className="font-display text-5xl font-bold tracking-tight uppercase">
          Your account
        </h1>
        <Suspense fallback={<p className="mt-6 text-muted-foreground">Loading your account…</p>}>
          <AccountDetails />
        </Suspense>
      </section>
      <PauseOffscreen />
    </>
  )
}

// Staff roles, in words. A traveler's role ("user") isn't worth showing.
const ROLES = { guide: "Tour guide", "lead-guide": "Lead guide", admin: "Admin" }

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

  return (
    <>
      {/* Who you are: your photo, your name, and your role if you're staff */}
      <div className="mt-8 flex items-center gap-5">
        <Avatar user={user} />
        <div>
          <p className="text-2xl font-bold">{user.name}</p>
          {user.role !== "user" && <p className="text-muted-foreground">{ROLES[user.role]}</p>}
        </div>
      </div>

      {/* Your name and email, which you can change (a Client Component: it keeps the form's
          state between tries) */}
      <h2 className="mt-12 font-display text-3xl font-bold tracking-tight uppercase">
        Your details
      </h2>
      <div className="mt-4">
        <DetailsForm name={user.name} email={user.email} />
      </div>

      {/* Changing your password (the email is for password managers: see PasswordForm) */}
      <h2 className="mt-12 font-display text-3xl font-bold tracking-tight uppercase">Password</h2>
      <div className="mt-4">
        <PasswordForm email={user.email} />
      </div>

      {/* A plain form, like the account menu's: it works even before the page's JavaScript */}
      <form action={logOut} className="mt-12">
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </>
  )
}

// Your photo, or the first letter of your name on sun yellow, like the navbar's account button.
// alt="": your name is right next to it.
function Avatar({ user }: { user: User }) {
  return (
    <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-3 border-navy-950 bg-cta text-4xl font-extrabold text-cta-foreground">
      {user.photo ? (
        <Image src={user.photo} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <span aria-hidden className="uppercase">
          {user.name[0]}
        </span>
      )}
    </div>
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
