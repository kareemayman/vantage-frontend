import type { Metadata } from "next"
import Link from "next/link"
import { Postcard } from "@/components/auth/postcard"
import { SignupForm } from "@/components/auth/signup-form"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours } from "@/lib/api"

export const metadata: Metadata = { title: "Sign up" } // -> "Sign up | Vantage"

// Sign up, on a postcard like the login page, but wider (four fields). Its front is the second
// best-rated tour's photo (the login page has the first), from the same saved list, so no API
// call.
export default async function SignupPage() {
  const tours = await getFeaturedTours()

  return (
    <>
      <section aria-labelledby="signup-title" className="overflow-x-clip px-6 pt-28 pb-24 md:pt-36">
        <Postcard
          tour={tours[1] ?? tours[0]}
          titleId="signup-title"
          title="Sign up"
          note="nice to meet you!"
          wide
          footer={
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold whitespace-nowrap text-primary underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          }
        >
          <SignupForm />
        </Postcard>
      </section>
      <PauseOffscreen />
    </>
  )
}
