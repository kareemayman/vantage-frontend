"use server"

import { redirect } from "next/navigation"
import * as z from "zod"
import { ApiError, patchMe, patchMyPassword, postLogin, postSignup } from "@/lib/api"
import { clearSession, getSession, setSession, type Session } from "@/lib/session"
import type { User } from "@/lib/users"

// Every Server Action that signs you up, logs you in or out, or changes your account lives in
// this file. "use server" makes each exported function callable from the browser: a form gets a
// reference to it, and Next turns the call into a POST request to our server, where it runs.

// The rules for a name and an email, shared by every form that asks for them (signup and your
// account's details), so they can't drift apart. They mirror the user model's
// (../backend/models/userModel.js): a name of 4 to 40 characters, a valid email. .trim() runs
// before the length check, so a name of spaces doesn't count, and the API gets it without them.
const NAME = z
  .string()
  .trim()
  .min(4, "Name must be at least 4 characters")
  .max(40, "Name must be 40 characters or fewer")
const EMAIL = z.email("Enter a valid email address")
// A password: at least 8 characters, like the user model's (login, signup, and a new password)
const PASSWORD = z.string().min(8, "Password must be at least 8 characters long")

// Zod: describe what a valid form looks like once, then check any data against it.
// z.object({ ... }) is the whole form, each key a field with its rules, and each rule carries
// the message to show when it fails. The API still checks everything itself (it decides who
// you are); this catches simple slips early, with a message under the right field.
const LoginFields = z.object({
  email: EMAIL,
  password: PASSWORD,
})

// What the form shows after a try:
// - errors: messages under the fields, from Zod (a list per field, the way Zod gives them)
// - message: one for the whole form, when the API says no or can't be reached
// - email: what was typed, to put back in its field (React empties the form after each try)
// - tries: counts the tries, so the form can announce the same message twice in a row
// - ok: you're logged in. The form stamps the postcard, then goes on (usePostmark): home, or
//   back where you were going.
export type LoginState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
  email?: string
  tries?: number
  ok?: boolean
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

  // 3. Keep it in the session cookie (setting a cookie makes Next re-render the page, so the
  // navbar shows you at once), and tell the form it worked. The form moves on itself, once
  // the postmark has landed: a redirect() from here would leave before it does.
  await setSession(session)
  return { ok: true }
}

// The signup form's fields, mirroring the user model's rules (../backend/models/userModel.js):
// a name, an email and a password (NAME, EMAIL and PASSWORD, above), and the same password
// twice.
// .refine() is a rule about the whole form, not one field: it gets every field at once, and
// `path` says which field's message it is. Zod runs it even when other fields have problems, so
// a short password that also doesn't match shows both messages at once.
const SignupFields = z
  .object({
    name: NAME,
    email: EMAIL,
    password: PASSWORD,
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
  ok?: boolean
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

  // 3. You're logged in: keep the session, and let the form stamp the postcard and go home
  await setSession(session)
  return { ok: true }
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

// Your account's details: a name and an email, with signup's rules
const DetailsFields = z.object({ name: NAME, email: EMAIL })

// What the details form shows after a try: like SignupState, plus `saved` when it worked
export type DetailsState = {
  errors?: { name?: string[]; email?: string[] }
  message?: string
  name?: string
  email?: string
  tries?: number
  saved?: boolean
}

// The account page's "Your details" form: saves your name and email (PATCH /users/updateMe)
export async function updateDetails(
  previous: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  // Anyone can send this request, not just the page that shows the form, so the action checks
  // the session itself (Next's advice: every Server Action authorizes itself)
  const session = await getSession()
  if (!session) redirect("/login?next=/account")

  const name = String(formData.get("name") ?? "")
  const email = String(formData.get("email") ?? "")
  const typed = { name, email, tries: (previous.tries ?? 0) + 1 }

  // 1. Check the fields
  const fields = DetailsFields.safeParse({ name, email })
  if (!fields.success) return { errors: z.flattenError(fields.error).fieldErrors, ...typed }

  // 2. Ask the API to save them, with your token
  let user: User
  try {
    user = await patchMe(session.token, fields.data)
  } catch (error) {
    // The API turned the token down (a password changed on another device): the session is over.
    // An action can delete the cookie (a page can't), so it does, then goes to log in.
    if (error instanceof ApiError && error.status === 401) {
      await clearSession()
      redirect("/login?next=/account")
    }
    if (emailTaken(error)) {
      return { errors: { email: ["There's already an account with this email"] }, ...typed }
    }
    const message = problem(error, "We couldn't save your details just now. Please try again.")
    return { message, ...typed }
  }

  // 3. Saved. The navbar shows your name from the session, so save it there too (the same
  // token; setSession keeps its end time). Setting the cookie also makes Next re-render the
  // page, so the form fills in with what the API saved (an email in lowercase, a trimmed name).
  await setSession({ token: session.token, user: { name: user.name, photo: user.photo } })
  return { saved: true, tries: typed.tries }
}

// Changing your password: the one you have now (only required: the API checks it), and a new one
// twice, with signup's rules
const PasswordFields = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: PASSWORD,
    passwordConfirm: z.string(),
  })
  .refine((fields) => fields.password === fields.passwordConfirm, {
    error: "The passwords don't match",
    path: ["passwordConfirm"],
  })

// What the password form shows after a try. Nothing typed comes back: React empties the form
// after each try, and passwords are never sent back to the page.
export type PasswordState = {
  errors?: { currentPassword?: string[]; password?: string[]; passwordConfirm?: string[] }
  message?: string
  tries?: number
  saved?: boolean
}

// The account page's "Password" form (PATCH /users/updateMyPassword)
export async function changePassword(
  previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await getSession()
  if (!session) redirect("/login?next=/account")
  const tries = (previous.tries ?? 0) + 1

  // 1. Check the fields
  const fields = PasswordFields.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  })
  if (!fields.success) return { errors: z.flattenError(fields.error).fieldErrors, tries }

  // 2. Ask the API to change it, with your token. It answers with a new token.
  let token: string
  try {
    token = await patchMyPassword(session.token, fields.data)
  } catch (error) {
    if (wrongPassword(error)) {
      return { errors: { currentPassword: ["That's not your current password"] }, tries }
    }
    // Any other 401: the session itself is over, like in updateDetails
    if (error instanceof ApiError && error.status === 401) {
      await clearSession()
      redirect("/login?next=/account")
    }
    const message = problem(error, "We couldn't change your password just now. Please try again.")
    return { message, tries }
  }

  // 3. Changed. The old token stops working now, so the session switches to the new one (with a
  // fresh 2 hours); your name and photo stay as they were. Without this you'd be logged out.
  await setSession({ token, user: session.user })
  return { saved: true, tries }
}

// A wrong current password. The API answers it with a 401, like a dead token, so only its
// message tells them apart ("Your current password is incorrect"), like emailTaken. It breaks if
// the API's wording changes.
function wrongPassword(error: unknown) {
  return (
    error instanceof ApiError && error.status === 401 && /current password/i.test(error.message)
  )
}

// The account page's "Log in again", when the API has turned the session's token down (a
// password changed on another device, or the account deleted). The cookie is no use anymore,
// and only a Server Action can delete it. Like logOut, but on to the login page, which brings
// you back to your account afterward (next, see usePostmark).
export async function logInAgain() {
  await clearSession()
  redirect("/login?next=/account")
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
