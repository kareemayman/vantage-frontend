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
  startLocation: { description: string }
}

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
    startLocation: { description: "Miami, USA" },
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
    startLocation: { description: "Banff, Canada" },
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
    startLocation: { description: "Utah, USA" },
  },
]
