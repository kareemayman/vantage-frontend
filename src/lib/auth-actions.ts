"use server"

import { redirect } from "next/navigation"
import * as z from "zod"
import { ApiError, postLogin, postSignup } from "@/lib/api"
import { clearSession, setSession, type Session } from "@/lib/session"

// Every Server Action that signs you up, logs you in or logs you out lives in this file.
// "use server" makes each exported function callable from the browser: a form gets a reference
// to it, and Next turns the call into a POST request to our server, where the function runs.

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

  // 2. Ask the API to log you in. fields.data is typed: TypeScript knows both are strings now.
  // It answers with a token and who you are; the session keeps the token, plus the name and
  // photo the navbar shows, so no page ever has to ask the API who you are.
  let session: Session
  try {
    const { token, user } = await postLogin(fields.data.email, fields.data.password)
    session = { token, user: { name: user.name, photo: user.photo } }
  } catch (error) {
    const message = problem(error, "We couldn't log you in just now. Please try again in a minute.")
    return { message, email, tries }
  }

  // 3. Keep it in the session cookie, then go to the homepage. redirect() works by throwing,
  // so it stays outside the try above, whose catch would swallow it.
  await setSession(session)
  redirect("/")
}

// The signup form's fields, mirroring the user model's rules (../backend/models/userModel.js):
// a name of 4 to 40 characters, a valid email, a password of at least 8, and the same password
// twice. .trim() runs before the length check, so a name of spaces doesn't count, and the API
// gets the name without them.
// .refine() is a rule about the whole form, not one field: it gets every field at once, and
// `path` says which field's message it is. Zod runs it even when other fields have problems, so
// a short password that also doesn't match shows both messages at once.
const SignupFields = z
  .object({
    name: z
      .string()
      .trim()
      .min(4, "Name must be at least 4 characters")
      .max(40, "Name must be 40 characters or fewer"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string(),
  })
  .refine((fields) => fields.password === fields.passwordConfirm, {
    error: "The passwords don't match",
    path: ["passwordConfirm"],
  })

// What the signup form shows after a try: like LoginState, with the name put back too (never
// the passwords)
export type SignupState = {
  errors?: { name?: string[]; email?: string[]; password?: string[]; passwordConfirm?: string[] }
  message?: string
  name?: string
  email?: string
  tries?: number
}

// The signup form's action: the same three steps as logIn
export async function signUp(previous: SignupState, formData: FormData): Promise<SignupState> {
  const name = String(formData.get("name") ?? "")
  const email = String(formData.get("email") ?? "")
  const typed = { name, email, tries: (previous.tries ?? 0) + 1 }

  // 1. Check the fields
  const fields = SignupFields.safeParse({
    name,
    email,
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  })
  if (!fields.success) return { errors: z.flattenError(fields.error).fieldErrors, ...typed }

  // 2. Ask the API to create the account. It answers like a login: a token and who you are.
  let session: Session
  try {
    const { token, user } = await postSignup(fields.data)
    session = { token, user: { name: user.name, photo: user.photo } }
  } catch (error) {
    if (emailTaken(error)) {
      return { errors: { email: ["There's already an account with this email"] }, ...typed }
    }
    const message = problem(error, "We couldn't create your account just now. Please try again.")
    return { message, ...typed }
  }

  // 3. You're logged in: keep the session, then go to the homepage
  await setSession(session)
  redirect("/")
}

// A taken email, as the API sends it (Kareem's call: read its error, rather than change the API).
// Development answers 500 with MongoDB's own words ("E11000 duplicate key error … email_1 dup key:
// { email: … }"), production 400 with "Duplicate field value: {"email":…}". Both say "duplicate"
// and "email", in any case, so this checks for those two words.
function emailTaken(error: unknown) {
  return (
    error instanceof ApiError && /duplicate/i.test(error.message) && /email/i.test(error.message)
  )
}

// The account menu's "Log out". Forgetting the session is all it takes: the API's token can't
// be cancelled (it stays valid until it runs out, within 2 hours), but once the cookie is gone,
// nothing has it anymore. Deleting a cookie in a Server Action makes Next re-render the
// layout, so the navbar goes back to "Log in" and "Sign up". Then home, like after logging in.
export async function logOut() {
  await clearSession()
  redirect("/")
}

// What to tell the visitor when the API says no, or can't be reached. `fallback` is the form's
// own sentence for anything unexpected.
function problem(error: unknown, fallback: string) {
  // A wrong email or password: the API's own message
  if (error instanceof ApiError && error.status === 401) return error.message
  if (error instanceof ApiError && error.status === 429) {
    return "Too many tries for now. Please wait a while, then try again."
  }
  console.error(error) // anything else is unexpected: keep the details in the server's log
  return fallback
}
