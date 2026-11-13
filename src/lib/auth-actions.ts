"use server"

import { redirect } from "next/navigation"
import * as z from "zod"
import { ApiError, getLoginToken } from "@/lib/api"
import { setSession } from "@/lib/session"

// Every Server Action that logs you in or out lives in this file. "use server" makes each
// exported function callable from the browser: a form gets a reference to it, and Next turns
// the call into a POST request to our server, where the function runs.

// Zod: describe what a valid form looks like once, then check any data against it.
// z.object({ ... }) is the whole form, each key a field with its rules, and each rule carries
// the message to show when it fails. The API still checks everything itself (it decides who
// you are); this catches simple slips early, with a message under the right field.
const LoginFields = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

// What the form shows after a try:
// - errors: messages under the fields, from Zod (a list per field, the way Zod gives them)
// - message: one for the whole form, when the API says no or can't be reached
// - email: what was typed, to put back in its field (React empties the form after each try)
// - tries: counts the tries, so the form can announce the same message twice in a row
export type LoginState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
  email?: string
  tries?: number
}

// The login form's action. useActionState calls it with the state it answered last time,
// then the form's fields (FormData: the browser's own name → value list).
export async function logIn(previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
  const tries = (previous.tries ?? 0) + 1

  // 1. Check the fields. safeParse never throws: it answers { success: true, data } with the
  // checked values, or { success: false, error } with every problem it found.
  // z.flattenError turns those problems into { fieldErrors: { email: ["…"] } }.
  const fields = LoginFields.safeParse({ email, password: formData.get("password") })
  if (!fields.success) return { errors: z.flattenError(fields.error).fieldErrors, email, tries }

  // 2. Ask the API for a token. fields.data is typed: TypeScript knows both are strings now.
  let token: string
  try {
    token = await getLoginToken(fields.data.email, fields.data.password)
  } catch (error) {
    return { message: problem(error), email, tries }
  }

  // 3. Keep the token in the session cookie, then go to the homepage. redirect() works by
  // throwing, so it stays outside the try above, whose catch would swallow it.
  await setSession(token)
  redirect("/")
}

// What to tell the visitor when the API says no, or can't be reached
function problem(error: unknown) {
  // A wrong email or password: the API's own message
  if (error instanceof ApiError && error.status === 401) return error.message
  if (error instanceof ApiError && error.status === 429) {
    return "Too many tries for now. Please wait a while, then try again."
  }
  console.error(error) // anything else is unexpected: keep the details in the server's log
  return "We couldn't log you in just now. Please try again in a minute."
}
