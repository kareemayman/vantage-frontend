// A tour as the API sends it (../backend/models/tourModel.js), with only the fields
// the site shows so far. Add fields here as pages need them.
export type Tour = {
  _id: string // for asking the API about this tour, e.g. its reviews
  name: string
  slug: string
  duration: number // days
  difficulty: "easy" | "medium" | "difficult"
  price: number // US dollars per person
  ratingsAverage: number
  ratingsQuantity: number
  summary: string
  imageCover: string // a Cloudinary public ID, e.g. "the-sea-explorer-cover"
  images: string[] // three more public IDs: "the-sea-explorer-1" to "-3"
  startLocation: {
    description: string
    coordinates: [number, number] // [longitude, latitude]: the API's (GeoJSON's) order
  }
}

// A tour's length in words: "1 day", "7 days". The API has no minimum length, so a one-day
// tour can exist.
export const days = (count: number) => `${count} ${count === 1 ? "day" : "days"}`

// Everything a tour's own page (/tours/[slug]) shows: the card's fields and the rest of what
// GET /tours?slug= sends, with the guides filled in
export type TourDetails = Tour & {
  description: string // paragraphs, split by "\n"
  maxGroupSize: number
  priceDiscount?: number // dollars off the price; no seed tour has one yet
  startDates: string[] // ISO dates, e.g. "2021-06-19T09:00:00.000Z" (all past until backend item 4)
  startLocation: { address: string }
  locations: { description: string; day: number; coordinates: [number, number] }[] // the stops
  guides: Guide[]
}

// A guide as a tour sends them (a user, ../backend/models/userModel.js). The API sends their
// email too (backend item 15), but no page shows it.
export type Guide = {
  _id: string
  name: string
  role: "guide" | "lead-guide"
  photo?: string // a Cloudinary public ID, e.g. "miyah-myles"
}

// The tour stats as GET /tours/stats sends them (data.stats[0], from getTourStats in
// ../backend/controllers/tourController.js), with only the fields the site shows
export type TourStats = {
  toursCount: number
  totalRatings: number // the number of reviews, all tours together
  avgRating: number // the average of every review, not rounded (4.608…)
}
