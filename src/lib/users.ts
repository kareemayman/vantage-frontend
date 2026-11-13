// A user as the API describes you after you log in (POST /users/login's `data`; signup sends
// the same), with only the fields it sends there (../backend/controllers/authController.js)
export type User = {
  _id: string
  name: string
  email: string
  photo?: string // a Cloudinary public ID, e.g. "lourdes-browning"; new accounts have none
  role: "user" | "guide" | "lead-guide" | "admin"
}
