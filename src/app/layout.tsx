import type { Metadata } from "next"
import { Figtree, Oswald, Shadows_Into_Light } from "next/font/google"
import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { SmoothScroll } from "@/components/smooth-scroll"
import { motionInitScript } from "@/lib/motion"
import { themeInitScript } from "@/lib/theme"
import "./globals.css"

// Body text: forms, paragraphs, prices, buttons
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
})

// Big titles: free stand-in for Balboa
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
})

// Handwritten accents: notes, doodles, easter eggs (only has weight 400)
const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: {
    default: "Vantage | Summer tours worth the trip",
    // Child pages set just their own part: { title: "Tours" } -> "Tours | Vantage"
    template: "%s | Vantage",
  },
  description:
    "Book hand-picked summer tours to beaches, islands and coastlines, led by local guides.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the head script may add data-theme before React loads,
    // so React shouldn't complain that <html> differs from the server HTML.
    // scroll-pt-*: when the browser scrolls to a link target or a focused element,
    // it stops below the fixed navbar instead of hiding it underneath.
    // No h-full here: Lenis watches <html> grow to know how far the page scrolls.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} ${oswald.variable} ${shadowsIntoLight.variable} scroll-pt-24 antialiased md:scroll-pt-28`}
    >
      <head>
        {/* Plain inline script: runs while the HTML is parsed, before the first paint.
            Restores the saved theme and the "Reduce motion" switch. */}
        <script>{themeInitScript + motionInitScript}</script>
      </head>
      {/* min-h-svh + flex-1 on <main>: short pages still push the footer to the bottom */}
      <body className="flex min-h-svh flex-col">
        <SmoothScroll />
        {/* Invisible until focused: lets keyboard users jump past the navbar */}
        <a
          href="#main"
          className="sr-only rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
        >
          Skip to content
        </a>
        <Navbar />
        {/* The one <main> on every page; pages render their sections inside it */}
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
