import { type NextRequest, NextResponse } from "next/server"
import { COOKIE } from "@/lib/session"

// Next's version of Express middleware: it runs on the server before a page renders, for the
// paths in `matcher` below. The quick check: with no session cookie, you can't see a protected
// page, so it sends you to log in, with `next` saying where you were going (after logging in,
// usePostmark brings you back there).
// It only checks that the cookie is there. It never asks the API, because it also runs for
// every link prefetch, so it has to be fast. The page keeps the real check: the API verifies
// the token (src/app/account/page.tsx).
export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE)) return // returning nothing lets the request carry on

  const login = new URL("/login", request.url)
  login.searchParams.set("next", request.nextUrl.pathname) // e.g. /login?next=%2Faccount
  return NextResponse.redirect(login) // a 307: "go there instead"
}

// The protected pages, like the path you'd give Express's app.use(). Only the account page for
// now; bookings (phase 5) and admin (phase 6) join when they exist. Plain values only: Next
// reads them when it builds.
export const config = {
  matcher: ["/account/:path*"],
}
