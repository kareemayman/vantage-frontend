import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import { PauseOffscreen } from "@/components/pause-offscreen"

export const metadata: Metadata = { title: "Sign up" } // -> "Sign up | Vantage"

// Sign up. A plain page for now, like the login page: their design comes in phase 3 step 4.
export default function SignupPage() {
  return (
    <>
      <section
        aria-labelledby="signup-title"
        className="mx-auto max-w-md px-6 pt-28 pb-24 md:pt-36"
      >
        <h1
          id="signup-title"
          className="font-display text-5xl leading-none font-bold tracking-tight uppercase"
        >
          Sign up
        </h1>
        <p className="mt-3 text-muted-foreground">Nice to meet you.</p>
        <SignupForm />
        <p className="mt-8 text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
            Log in
          </Link>
        </p>
      </section>
      <PauseOffscreen />
    </>
  )
}
