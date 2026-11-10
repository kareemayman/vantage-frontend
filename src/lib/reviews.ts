// A review as GET /tours/:id/reviews sends it (../backend/controllers/reviewController.js):
// no tour (it's asked for by its tour), and the traveler's name and photo. user is null once
// that account is deleted. Used by a tour's page (all its reviews) and the homepage's
// polaroids (each featured tour's best one).
export type TourReview = {
  _id: string
  review: string
  rating: number // 1 to 5
  user: { name: string; photo?: string } | null
}
