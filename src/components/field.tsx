import { useId, type ComponentProps } from "react"

// The input's looks: a box (the default), a line to write on, like a postcard's address lines
// (the login and signup postcards), or a passport's line (the account page)
const LOOKS = {
  box: "h-12 rounded-xl border-2 bg-card px-4",
  line: "h-11 border-b-2 bg-transparent px-1",
  passport: "h-10 border-b-2 bg-transparent px-0.5",
}

// The label for each look. A passport prints its labels small, in spaced capitals ("NAME").
const LABELS = {
  box: "font-bold",
  line: "font-bold",
  passport: "text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase",
}

// A labeled input with a short note under it: its problem when there is one (red), or else an
// optional hint (gray, e.g. "At least 8 characters"). Used by the login and signup forms, the
// account page's passport, and shown on /design.
// useId gives each field a unique id: Next keeps recently visited pages in the document
// (hidden), so a plain id="email" could clash with another page's. aria-invalid and
// aria-describedby let screen readers say the field has a problem, and read the note with it.
export function Field({
  label,
  error,
  hint,
  look = "box",
  ...input
}: ComponentProps<"input"> & {
  label: string
  error?: string
  hint?: string
  look?: keyof typeof LOOKS
}) {
  const id = useId()
  const note = error ?? hint

  return (
    <div>
      <label htmlFor={id} className={LABELS[look]}>
        {label}
      </label>
      <input
        id={id}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        className={`mt-2 block w-full border-input aria-invalid:border-destructive ${LOOKS[look]}`}
        {...input}
      />
      {note && (
        <p
          id={`${id}-note`}
          className={`mt-2 text-sm font-medium ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {note}
        </p>
      )}
    </div>
  )
}
