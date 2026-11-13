import "server-only"
import { cookies } from "next/headers"

// The login session: the API's token, kept in a cookie on our own site. The browser sends the
// cookie back with every request to our Next server, which forwards the token to the API as
// "Authorization: Bearer <token>". The token never reaches the page's JavaScript.
const COOKIE = "session"

// The API's tokens last 2 hours (JWT_EXPIRES_IN in the backend's config.env), so the cookie
// does too. There's no refresh token: after 2 hours, you log in again.
const TWO_HOURS = 2 * 60 * 60 // in seconds

// Saves the token. Only works in a Server Action (or a route handler): a cookie is set by the
// response's Set-Cookie header, and only those can still change the response's headers.
export async function setSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, token, {
    httpOnly: true, // the page's JavaScript can't read it, so an injected script can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only, once deployed (localhost is http)
    sameSite: "lax", // not sent along when another site posts a form to ours
    path: "/", // sent with every page of the site
    maxAge: TWO_HOURS, // then the browser deletes it
  })
}
