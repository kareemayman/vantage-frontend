import Link from "next/link"
import type { ReactNode } from "react"
import { Crab } from "@/components/scene/beach"
import { Poke } from "@/components/scene/poke"
import { ThemeToggle } from "@/components/theme-toggle"

// Tour pages arrive in phase 2; the names match the API's seed tours
const TOURS = [
  { href: "/tours/the-sea-explorer", label: "The Sea Explorer" },
  { href: "/tours/the-forest-hiker", label: "The Forest Hiker" },
  { href: "/tours/the-star-gazer", label: "The Star Gazer" },
]
const COMPANY = [
  { href: "https://kareemayman-portfolio.vercel.app/", label: "About" },
  { href: "mailto:kareem.mohamed.ayman@gmail.com", label: "Contact" },
  { href: "https://github.com/kareemayman/vantage-frontend", label: "GitHub" },
]
const PORTFOLIO = COMPANY[0].href

// 09 Footer (design/HANDOFF.md). Server Component: only the theme switch and the
// crab inside it are Client Components.
export function Footer() {
  return (
    // overflow-hidden: the crab can scuttle around without causing a scrollbar
    <footer className="relative overflow-hidden border-t-3 border-outline bg-muted">
      {/* max-w-360 (1440px) + 80px sides: the design's 1440 layout, centered beyond it */}
      <div className="mx-auto max-w-360 px-4 pt-12 pb-9 md:px-10 md:pt-17.5 md:pb-11 lg:px-20">
        <div className="flex flex-col gap-7 lg:flex-row lg:justify-between">
          <div>
            {/* Wordmark: fluid from 60px (phones) to 110px (desktop). Its sun dot hops on hover. */}
            <Link
              href="/"
              className="group flex w-fit items-center gap-[0.13em] font-display text-[clamp(3.75rem,9vw,6.875rem)] leading-[0.9] font-bold tracking-[0.02em] uppercase"
            >
              <span
                aria-hidden
                className="size-[0.33em] shrink-0 origin-bottom rounded-full border-3 border-navy-950 bg-sun-300 motion-safe:group-hover:animate-hop md:border-4"
              />
              Vantage
            </Link>
            <p className="mt-2.5 -rotate-2 font-hand text-2xl text-primary md:mt-4 md:text-[30px]">
              made with sunscreen &amp; TypeScript
            </p>
          </div>

          <nav aria-label="Footer">
            {/* Phones: one flat grid of the main links, like the design (44px tap rows) */}
            <ul className="grid grid-cols-2 gap-x-3 text-[15px] md:hidden">
              <li>
                <FooterLink href="/tours" className="flex min-h-11 items-center">
                  Tours
                </FooterLink>
              </li>
              {COMPANY.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} className="flex min-h-11 items-center">
                    {link.label}
                  </FooterLink>
                </li>
              ))}
              <li>
                <ThemeSwitch className="flex min-h-11 items-center" />
              </li>
            </ul>

            {/* Wider screens: titled columns */}
            <div className="hidden gap-17.5 md:flex">
              <FooterColumn title="Tours">
                {TOURS.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </FooterColumn>
              <FooterColumn title="Company">
                {COMPANY.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </FooterColumn>
              {/* "Reduce motion" joins in step 5b; "Sound off" once the site has sounds */}
              <FooterColumn title="Settings">
                <li>
                  <ThemeSwitch />
                </li>
              </FooterColumn>
            </div>
          </nav>
        </div>

        {/* Credits, under a dashed "perforation" line */}
        <div className="mt-6 flex flex-col border-t-2 border-dashed border-dash pt-4.5 text-[13px] leading-[1.6] text-muted-foreground md:mt-12 md:pt-5.5 md:text-sm lg:mt-24 lg:flex-row lg:justify-between lg:gap-6">
          <p>© 2026 Vantage. A portfolio project, not a real airline (yet).</p>
          <p>
            Design &amp; code:{" "}
            <a
              href={PORTFOLIO}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Kareem
            </a>{" "}
            · Framework: Next.js · 3D: three.js · Style: TailwindCSS
          </p>
        </div>
      </div>

      {/* The hidden crab (an easter egg): faint until you notice it. Poke it and it
          scuttles off and back. Later it'll reveal the easter-egg counter. */}
      <Poke
        animation="scuttle"
        className="absolute right-3 bottom-9 cursor-pointer p-1 opacity-60 transition-opacity hover:opacity-100 motion-safe:data-playing:animate-scuttle md:right-6.5 md:bottom-21.5"
      >
        <Crab className="block w-8.5 md:w-10.5" />
      </Poke>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-[13px] font-bold tracking-[0.14em] uppercase">{title}</h2>
      <ul className="mt-3 flex flex-col items-start gap-3 leading-5">{children}</ul>
    </div>
  )
}

// Internal paths use Next's <Link>; websites open in a new tab; mailto opens the mail app
function FooterLink({
  href,
  className = "",
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const style = `transition-colors hover:text-primary ${className}`
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={style}>
        {children}
      </Link>
    )
  }
  const website = href.startsWith("http")
  return (
    <a
      href={href}
      target={website ? "_blank" : undefined}
      rel={website ? "noreferrer" : undefined}
      className={style}
    >
      {children}
    </a>
  )
}

// The third theme switch (with the nav button and the hero sun)
function ThemeSwitch({ className = "" }: { className?: string }) {
  return (
    <ThemeToggle
      labelLight="Switch to dark mode"
      labelDark="Switch to light mode"
      className={`cursor-pointer text-left transition-colors hover:text-primary ${className}`}
    >
      {/* Visible text; screen readers already hear the full label */}
      <span aria-hidden className="dark:hidden">
        Dark mode
      </span>
      <span aria-hidden className="hidden dark:inline">
        Light mode
      </span>
    </ThemeToggle>
  )
}
