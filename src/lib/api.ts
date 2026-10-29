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

// Tours, cheapest first. `query` takes the API's query options as they'd appear in the URL,
// e.g. { difficulty: "easy", "price[lte]": "1000", limit: "3" } (filters, sort, fields,
// limit, page. GET /tours sends { results, data: { docs } }.
// Cached, because the API sleeps on Render when idle and takes 30–60 s to wake up. Each
// different query is its own saved copy (the arguments are part of the cache's key).
export async function getTours(query: Record<string, string> = {}) {
  "use cache" // every visitor gets the same saved copy
  cacheLife("days") // fresh for a day, then refreshed in the background; gone after a week
  cacheTag("tours") // updateTag("tours") throws the copy away early (phase 6: admin edits)

  // -createdAt: a sort replaces the API's default (newest first), so tours with the same
  // price would come back in any order; this keeps ties newest first
  const params = new URLSearchParams({ sort: "price,-createdAt", ...query })
  const body = await get<{ data: { docs: Tour[] } }>(`/tours?${params}`)
  return body.data.docs
}
