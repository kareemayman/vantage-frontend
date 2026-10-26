import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import type { Tour } from "@/lib/tours"

// Every call to the Vantage API lives in this file. "server-only" turns any import from a
// Client Component into a build error, so API_URL (and, from phase 3, the login token)
// can never end up in the browser's JavaScript.

// GETs a path from the API and returns the JSON body. Success is the HTTP status
// (res.ok), not the body's `status` field: some replies have no JSON body to read
// (the rate limiter's plain-text message, Render's error page while the API is down).
async function get<T>(path: string): Promise<T> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) throw new Error("API_URL is missing: add it to .env.local")

  const res = await fetch(`${apiUrl}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`)
  return res.json()
}

// Every tour. GET /tours sends { results, data: { docs } }.
// "use cache" keeps the result on the Next server and gives every visitor the same copy.
// "days": after a day, the next visit still gets the saved copy while Next asks the API
// again in the background; only after a week with no visits does someone wait for the API.
// If the API is asleep or down, Next keeps the old copy and tries again on the next visit.
// The "tours" tag lets us throw the copy away early, e.g. after an admin edits a tour.
export async function getTours() {
  "use cache"
  cacheLife("days")
  cacheTag("tours")

  const body = await get<{ data: { docs: Tour[] } }>("/tours")
  return body.data.docs
}
