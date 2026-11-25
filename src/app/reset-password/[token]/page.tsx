import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Postcard } from "@/components/auth/postcard"
import { ResetForm } from "@/components/auth/reset-form"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours } from "@/lib/api"

export const metadata: Metadata = {
  title: "Pick a new password", // -> "… | Vantage"
  robots: { index: false }, // one person's link from one email: nothing for search engines
}

// Where the reset email's link lands: /reset-password/<token>. A postcard like "Forgot your
// password?", with the same tour on its front (the third featured one), so it feels like the
// same conversation.
// The token is URL data, so it's read inside <Suspense>, like the tour page's slug: the rest is
// built ahead of time. The fallback is the same form without the token, so nothing changes on
// screen when the real one takes its place, a moment later.
export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) {
  const [, , tour] = await getFeaturedTours()

  return (
    <>
      <section aria-labelledby="reset-title" className="overflow-x-clip px-6 pt-28 pb-24 md:pt-36">
        <Postcard
          tour={tour}
          titleId="reset-title"
          title="Pick a new password"
          longTitle
          note="almost there!"
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
          <Suspense fallback={<ResetForm />}>
            {params.then(({ token }) => (
              <ResetForm token={token} />
            ))}
          </Suspense>
        </Postcard>
      </section>
      <PauseOffscreen />
    </>
  )
}
