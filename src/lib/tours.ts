// A tour as the API sends it (../backend/models/tourModel.js), with only the fields
// the site shows so far. Add fields here as pages need them.
export type Tour = {
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

// The tour stats as GET /tours/stats sends them (data.stats[0], from getTourStats in
// ../backend/controllers/tourController.js), with only the fields the site shows
export type TourStats = {
  toursCount: number
  totalRatings: number // the number of reviews, all tours together
  avgRating: number
}

// Typed in for the three featured tours until phase 2 fetches the real stats. The API
// does the math; the frontend only shows the numbers.
export const TOUR_STATS: TourStats = { toursCount: 3, totalRatings: 21, avgRating: 4.87 }

// The homepage's featured tours, typed in from design/HANDOFF.md for now. Phase 2
// replaces this list with a fetch from the API; the components that show it stay the same.
export const FEATURED_TOURS: Tour[] = [
  {
    name: "The Sea Explorer",
    slug: "the-sea-explorer",
    duration: 7,
    difficulty: "medium",
    price: 497,
    ratingsAverage: 4.8,
    ratingsQuantity: 6,
    summary: "Exploring the jaw-dropping US east coast by foot and by boat.",
    imageCover: "the-sea-explorer-cover",
    images: ["the-sea-explorer-1", "the-sea-explorer-2", "the-sea-explorer-3"],
    startLocation: { description: "Miami, USA", coordinates: [-80.185942, 25.774772] },
  },
  {
    name: "The Forest Hiker",
    slug: "the-forest-hiker",
    duration: 5,
    difficulty: "easy",
    price: 397,
    ratingsAverage: 5,
    ratingsQuantity: 9,
    summary: "Breathtaking hike through the Canadian Banff National Park.",
    imageCover: "the-forest-hiker-cover",
    images: ["the-forest-hiker-1", "the-forest-hiker-2", "the-forest-hiker-3"],
    startLocation: { description: "Banff, Canada", coordinates: [-115.570154, 51.178456] },
  },
  {
    name: "The Star Gazer",
    slug: "the-star-gazer",
    duration: 9,
    difficulty: "medium",
    price: 2997,
    ratingsAverage: 4.8,
    ratingsQuantity: 6,
    summary: "The most remote and stunningly beautiful places for seeing the night sky.",
    imageCover: "the-star-gazer-cover",
    images: ["the-star-gazer-1", "the-star-gazer-2", "the-star-gazer-3"],
    startLocation: { description: "Utah, USA", coordinates: [-109.55099, 37.283469] },
  },
]
