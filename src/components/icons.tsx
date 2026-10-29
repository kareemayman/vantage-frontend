// Small icons used in more than one place. They inherit the text color (stroke-current)
// and take their size from className.

// The "go" arrow on links and buttons: "Explore tours →"
export function ArrowIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[2.6] ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// A map pin, before a tour's starting place
export function PinIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[2.4] ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s7-7.6 7-13a7 7 0 0 0-14 0c0 5.4 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
