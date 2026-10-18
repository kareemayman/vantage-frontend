import { FEATURED_TOURS, type Tour } from "@/lib/tours"

// A review as GET /reviews sends it (../backend/controllers/reviewController.js): the user
// comes with their name (and photo), and the whole tour comes along. Only the fields the
// site shows so far.
export type Review = {
  _id: string
  review: string
  rating: number // 1 to 5
  user: { name: string }
  tour: Tour
}

const [seaExplorer, forestHiker, starGazer] = FEATURED_TOURS

// The homepage's reviews, one per featured tour, typed in until phase 2 fetches them
// (reading reviews needs a login for now: backend checklist item 2). They're real seed
// reviews (same _id, traveler and rating) with the design's quotes, because the seed's
// text is lorem ipsum (backend checklist item 4).
export const FEATURED_REVIEWS: Review[] = [
  {
    _id: "5c8a34ed14eb5c17645c9108",
    review: "Our guide knew a taco stand that isn't on any map. I still think about it.",
    rating: 5,
    user: { name: "Lourdes Browning" },
    tour: seaExplorer,
  },
  {
    _id: "5c8a381714eb5c17645c9115",
    review: "Nine strangers, five days, one very patient elk. Best week of my year.",
    rating: 5,
    user: { name: "Ayla Cornell" },
    tour: forestHiker,
  },
  {
    _id: "5c8a36a014eb5c17645c910e",
    review: "I didn't know the sky had that many stars. Bring a jacket, trust me.",
    rating: 5,
    user: { name: "Sophie Louise Hart" },
    tour: starGazer,
  },
]
