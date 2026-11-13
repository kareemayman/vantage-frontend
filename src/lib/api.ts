import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import { BEST_RATED, DEFAULT_SORT, type ApiQuery } from "@/lib/tour-filters"
import type { TourReview } from "@/lib/reviews"
import type { Tour, TourDetails, TourStats } from "@/lib/tours"
import type { User } from "@/lib/users"

// Every call to the Vantage API lives in this file. "server-only" turns any import from a
// Client Component into a build error, so API_URL (and, from phase 3, the login token)
// can never end up in the browser's JavaScript.

// An error answer from the API: its HTTP status, and its own message when it sent one (e.g.
// 401 "Invalid email or password"), so a form can show it
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Sends a request to the API and returns the JSON body. Success is the HTTP status (res.ok),
// not the body's `status` field. Some replies have no JSON body to read (the rate limiter's
// plain-text message, Render's error page while the API is down), so `body` can be null.
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) throw new Error("API_URL is missing: add it to .env.local")

  // Render's free API naps when it's quiet, and waking it takes 30–60 s. After 90 s it's stuck,
  // so give up: the fetch throws, and the tours page shows its "can't load" note instead of
  // waiting forever.
  const res = await fetch(`${apiUrl}${path}`, { ...init, signal: AbortSignal.timeout(90_000) })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const fallback = `${init.method ?? "GET"} ${path} failed with ${res.status}`
    throw new ApiError(res.status, body?.message ?? fallback)
  }
  return body
}

const get = <T>(path: string) => request<T>(path)

// Sends `data` as JSON, the way the API's forms expect it (Express's express.json() reads it)
const post = <T>(path: string, data: unknown) =>
  request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

// Logs in: POST /users/login checks the email and password and answers with a token (a JWT,
// the API's proof of who you are, good for 2 hours) and who you are (`data`). A wrong email or
// password throws an ApiError with status 401. Never cached: every login must really ask.
export async function postLogin(email: string, password: string) {
  const body = await post<{ token: string; data: User }>("/users/login", { email, password })
  return { token: body.token, user: body.data }
}

// Tours, cheapest first. `query` takes the API's query options as they'd appear in the URL,
// e.g. { difficulty: ["easy", "medium"], "price[lte]": "1000", limit: "3" } (filters, sort,
// fields, limit, page; {} is the whole list). GET /tours sends { results, data: { docs } }.
// Cached, because the API sleeps on Render when idle and takes 30–60 s to wake up. Each
// different query is its own saved copy (the arguments are part of the cache's key).
export async function getTours(query: ApiQuery) {
  "use cache" // every visitor gets the same saved copy
  cacheLife("days") // fresh for a day, then refreshed in the background; gone after a week
  cacheTag("tours") // updateTag("tours") throws the copy away early (phase 6: admin edits)

  const params = new URLSearchParams({ sort: DEFAULT_SORT })
  for (const [key, value] of Object.entries(query)) {
    params.delete(key) // a query's own sort replaces the default
    for (const one of [value].flat()) params.append(key, one)
  }
  const body = await get<{ data: { docs: Tour[] } }>(`/tours?${params}`)
  return body.data.docs
}

// The homepage's three tours: the best rated (GET /tours?sort=-ratingsAverage,...&limit=3).
// Not cached itself: getTours saves the answer, and the query never changes, so every visitor
// shares one copy.
export function getFeaturedTours() {
  return getTours({ sort: BEST_RATED, limit: "3" })
}

// The site's totals: how many tours, how many reviews, and the average of every review.
// GET /tours/stats sends { data: { stats: [{ toursCount, totalRatings, avgRating, ... }] } }:
// one group over every tour. The API does the math; the homepage only shows the numbers.
export async function getTourStats() {
  "use cache"
  cacheLife("days")
  cacheTag("tours", "reviews") // a new tour or a new review both change the totals

  const body = await get<{ data: { stats: TourStats[] } }>("/tours/stats")
  return body.data.stats[0]
}

// One tour, by its slug, with its guides. The API has no slug endpoint, so this asks for the
// list filtered by slug, which holds 0 or 1 tours. null: there's no such tour.
export async function getTour(slug: string) {
  "use cache"
  cacheLife("days")
  cacheTag("tours")

  // The slug comes from the page's URL, so it can be anything: URLSearchParams encodes it,
  // or a slug like "x&price[lt]=1" would add its own filters to the API's query
  const body = await get<{ data: { docs: TourDetails[] } }>(
    `/tours?${new URLSearchParams({ slug })}`,
  )
  return body.data.docs[0] ?? null
}

// A tour's best review, for the homepage's polaroids: the highest rated, and the newest of
// those on a tie (the API doesn't send createdAt, but it can still sort by it). null: the tour
// has no reviews yet.
// For now: later (Kareem's plan) the reviews will come with the tours, from the tours
// endpoint, and this call goes.
export async function getBestReview(tourId: string) {
  "use cache"
  cacheLife("days")
  cacheTag("reviews")

  const body = await get<{ data: { reviews: TourReview[] } }>(
    `/tours/${tourId}/reviews?sort=-rating,-createdAt&limit=1`,
  )
  // at(0), not [0]: TypeScript then knows the list can be empty
  return body.data.reviews.at(0) ?? null
}

// One tour's reviews, each with the traveler's name and photo.
// GET /tours/:id/reviews sends { results, data: { reviews } }.
export async function getTourReviews(tourId: string) {
  "use cache"
  cacheLife("days")
  cacheTag("reviews") // phase 4: updateTag("reviews") after someone writes one

  const body = await get<{ data: { reviews: TourReview[] } }>(`/tours/${tourId}/reviews`)
  return body.data.reviews
}
