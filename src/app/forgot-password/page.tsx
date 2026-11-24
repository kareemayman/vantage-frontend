import type { Metadata } from "next"
import Link from "next/link"
import { ForgotForm } from "@/components/auth/forgot-form"
import { Postcard } from "@/components/auth/postcard"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours } from "@/lib/api"

export const metadata: Metadata = { title: "Forgot your password" } // -> "… | Vantage"

// "Forgot your password?", on the back of a postcard like login and signup. Its front is the
// third featured tour's photo (login shows the first, signup the second), from the homepage's
// saved list, so the page is built ahead of time; only the form talks to the server.
// overflow-x-clip: the tilted photo can poke past a phone's edge.
export default async function ForgotPasswordPage() {
  const [, , tour] = await getFeaturedTours()

  return (
    <>
      <section aria-labelledby="forgot-title" className="overflow-x-clip px-6 pt-28 pb-24 md:pt-36">
        <Postcard
          tour={tour}
          titleId="forgot-title"
          title="Forgot your password?"
          longTitle
          note="it happens! we'll email you a link."
          footer={
            <p>
              Remembered it?{" "}
              <Link
                href="/login"
                className="font-semibold whitespace-nowrap text-primary underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          }
        >
          <ForgotForm />
        </Postcard>
      </section>
      <PauseOffscreen />
    </>
  )
}
