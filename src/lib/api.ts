import "server-only"
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
export async function getTours() {
  const body = await get<{ data: { docs: Tour[] } }>("/tours")
  return body.data.docs
}
