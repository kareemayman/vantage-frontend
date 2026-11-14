import { useId, type ComponentProps } from "react"

// A labeled input with a short note under it: its problem when there is one (red), or else an
// optional hint (gray, e.g. "At least 8 characters"). Used by the login and signup forms, and
// shown on /design.
// useId gives each field a unique id: Next keeps recently visited pages in the document
// (hidden), so a plain id="email" could clash with another page's. aria-invalid and
// aria-describedby let screen readers say the field has a problem, and read the note with it.
export function Field({
  label,
  error,
  hint,
  ...input
}: ComponentProps<"input"> & { label: string; error?: string; hint?: string }) {
  const id = useId()
  const note = error ?? hint

  return (
    <div>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        className="mt-2 block h-12 w-full rounded-xl border-2 border-input bg-card px-4 aria-invalid:border-destructive"
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
