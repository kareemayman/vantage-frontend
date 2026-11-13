import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { PauseOffscreen } from "@/components/pause-offscreen"

export const metadata: Metadata = { title: "Log in" } // -> "Log in | Vantage"

// Log in. A plain page for now: its design comes in phase 3 step 4. It reads nothing about the
// visitor, so it's built ahead of time like the others; only the form talks to the server.
export default function LoginPage() {
  return (
    <>
      <section aria-labelledby="login-title" className="mx-auto max-w-md px-6 pt-28 pb-24 md:pt-36">
        <h1
          id="login-title"
          className="font-display text-5xl leading-none font-bold tracking-tight uppercase"
        >
          Log in
        </h1>
        <p className="mt-3 text-muted-foreground">Welcome back.</p>
        <LoginForm />
        <p className="mt-8 text-center">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </section>
      <PauseOffscreen />
    </>
  )
}
