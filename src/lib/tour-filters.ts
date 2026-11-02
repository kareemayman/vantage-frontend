// The tours page's filters and sort, which live in the URL, e.g.
// /tours?difficulty=easy,medium&length=short&sort=rating
// This file turns the URL into filters, and filters into a URL or an API query. The server and
// the browser both use it, so it can't import anything server-only.

// A query for the API. An array repeats the key, which the API reads as "this OR that":
// difficulty=easy&difficulty=medium
export type ApiQuery = Record<string, string | string[]>

export type Filters = {
  difficulty: string[] // any number of them
  length: string | null // one at most: the API can only do one range per field, not
  price: string | null // "under $500 OR over $1,500"
  sort: string
}

export const HOW_HARD = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "difficult", label: "Difficult" },
]

export const HOW_LONG = [
  { value: "short", label: "Up to 5 days", api: { "duration[lte]": "5" } },
  { value: "medium", label: "6–9 days", api: { "duration[gte]": "6", "duration[lte]": "9" } },
  { value: "long", label: "10+ days", api: { "duration[gte]": "10" } },
]

export const PRICES = [
  { value: "under500", label: "Under $500", api: { "price[lt]": "500" } },
  { value: "mid", label: "$500–$1,500", api: { "price[gte]": "500", "price[lte]": "1500" } },
  { value: "over1500", label: "Over $1,500", api: { "price[gt]": "1500" } },
]

// The first one is the default, and stays out of the URL. Each ends in -createdAt, so tours
// that tie on everything else always come back in the same order, and the cards don't swap.
export const SORTS = [
  { value: "price-asc", label: "Price: low to high", api: "price,-ratingsAverage,-createdAt" },
  { value: "price-desc", label: "Price: high to low", api: "-price,-ratingsAverage,-createdAt" },
  {
    value: "rating",
    label: "Rating: best first",
    api: "-ratingsAverage,-ratingsQuantity,-createdAt",
  },
  { value: "length", label: "Length: shortest first", api: "duration,price,-createdAt" },
]

export const DEFAULT_SORT = SORTS[0].api

export const NO_FILTERS: Filters = {
  difficulty: [],
  length: null,
  price: null,
  sort: SORTS[0].value,
}

export const hasFilters = ({ difficulty, length, price }: Filters) =>
  difficulty.length > 0 || length !== null || price !== null

// The URL can hold anything anyone types, so only values from the lists above get through.
// That keeps odd queries away from the API, and limits how many saved copies getTours can
// make. The difficulties come out in the list's order, so "medium,easy" and "easy,medium" are
// the same query.
export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const known = (options: { value: string }[], value: unknown) =>
    options.find((option) => option.value === value)?.value ?? null
  // String(): ?difficulty=easy&difficulty=medium arrives as an array, which becomes "easy,medium"
  const difficulty = String(params.difficulty ?? "").split(",")

  return {
    difficulty: HOW_HARD.map((option) => option.value).filter((value) =>
      difficulty.includes(value),
    ),
    length: known(HOW_LONG, params.length),
    price: known(PRICES, params.price),
    sort: known(SORTS, params.sort) ?? NO_FILTERS.sort,
  }
}

// What to ask the API for. No filters and the default sort give {}, the same saved copy as the
// whole list (see getTours).
export function filtersToQuery({ difficulty, length, price, sort }: Filters): ApiQuery {
  const query: ApiQuery = {}
  if (difficulty.length) query.difficulty = difficulty
  Object.assign(
    query,
    HOW_LONG.find((option) => option.value === length)?.api,
    PRICES.find((option) => option.value === price)?.api,
  )
  const order = SORTS.find((option) => option.value === sort)?.api
  if (order && order !== DEFAULT_SORT) query.sort = order
  return query
}

// The page's URL for these filters
export function filtersToUrl({ difficulty, length, price, sort }: Filters) {
  const params = new URLSearchParams()
  const hard = HOW_HARD.map((option) => option.value).filter((value) => difficulty.includes(value))
  if (hard.length) params.set("difficulty", hard.join(","))
  if (length) params.set("length", length)
  if (price) params.set("price", price)
  if (sort !== NO_FILTERS.sort) params.set("sort", sort)
  // Commas are safe in a URL, and much easier to read than %2C
  const query = params.toString().replaceAll("%2C", ",")
  return query ? `/tours?${query}` : "/tours"
}
