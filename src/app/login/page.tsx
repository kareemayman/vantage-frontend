import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Postcard } from "@/components/auth/postcard"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours } from "@/lib/api"

export const metadata: Metadata = { title: "Log in" } // -> "Log in | Vantage"

// Log in, written on the back of a postcard (src/components/auth/postcard.tsx). Its front is
// the best-rated tour's photo, from the homepage's saved list, so it costs no API call and the
// page is still built ahead of time; only the form talks to the server.
// overflow-x-clip: the tilted photo can poke past a phone's edge.
export default async function LoginPage() {
  const [tour] = await getFeaturedTours()

  return (
    <>
      <section aria-labelledby="login-title" className="overflow-x-clip px-6 pt-28 pb-24 md:pt-36">
        <Postcard
          tour={tour}
          titleId="login-title"
          title="Log in"
          note="good to see you again!"
          footer={
            <p>
              New here?{" "}
              <Link
                href="/signup"
                className="font-semibold whitespace-nowrap text-primary underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          }
        >
          <LoginForm />
        </Postcard>
      </section>
      <PauseOffscreen />
    </>
  )
}
