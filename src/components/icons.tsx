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
