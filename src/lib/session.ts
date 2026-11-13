import "server-only"
import { cookies } from "next/headers"
import * as z from "zod"

// The login session: the API's token, plus the little the navbar shows about you (your name and
// photo), kept together in one cookie on our own site. The browser sends it back with every
// request to our Next server, which forwards the token to the API as "Authorization: Bearer
// <token>". The token never reaches the page's JavaScript.
const COOKIE = "session"

// The API's tokens last 2 hours (JWT_EXPIRES_IN in the backend's config.env), so the cookie
// does too. There's no refresh token: after 2 hours, you log in again.
const TWO_HOURS = 2 * 60 * 60 // in seconds

// What the cookie holds, as a Zod schema. It's checked every time it's read, because a cookie
// comes from the browser and can hold anything: an older format, or a value edited by hand.
const SessionCookie = z.object({
  token: z.string(),
  user: z.object({ name: z.string(), photo: z.string().optional() }),
})

// z.infer turns the schema into its TypeScript type, so the shape is only written once:
// { token: string; user: { name: string; photo?: string } }
export type Session = z.infer<typeof SessionCookie>

// Saves the session, as JSON. Only works in a Server Action (or a route handler): a cookie is set
// by the response's Set-Cookie header, and only those can still change the response's headers.
export async function setSession(session: Session) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, JSON.stringify(session), {
    httpOnly: true, // the page's JavaScript can't read it, so an injected script can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only, once deployed (localhost is http)
    sameSite: "lax", // not sent along when another site posts a form to ours
    path: "/", // sent with every page of the site
    maxAge: TWO_HOURS, // then the browser deletes it
  })
}

// Forgets the session: the response tells the browser to delete the cookie. Like setSession,
// only in a Server Action (or a route handler). delete() uses path "/", like the cookie, and a
// browser only deletes a cookie whose name and path both match.
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}

// The visitor's session, or null when they're logged out. It reads the request's cookies, so a
// component that calls it can't be built ahead of time: it has to sit inside a <Suspense>.
// Zod's parse, unlike safeParse, throws when the shape is wrong, the way JSON.parse throws on
// broken JSON, so one catch turns both into "logged out".
export async function getSession() {
  const value = (await cookies()).get(COOKIE)?.value
  if (!value) return null
  try {
    return SessionCookie.parse(JSON.parse(value))
  } catch {
    return null
  }
}
