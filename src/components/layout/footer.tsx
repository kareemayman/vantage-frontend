export function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold tracking-tight uppercase">Vantage</p>
          <p className="-rotate-1 font-hand text-lg text-primary">
            made with sunscreen &amp; TypeScript
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Vantage · A portfolio project by{" "}
          <a
            href="https://github.com/kareemayman"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Kareem Ayman
          </a>
        </p>
      </div>
    </footer>
  )
}
