import Image from "next/image"
import type { ReactNode } from "react"
import { DetailsForm } from "@/components/account/details-form"
import { PasswordForm } from "@/components/account/password-form"
import { Logo } from "@/components/logo"
import type { User } from "@/lib/users"

// Your role, printed on the photo page
const ROLES = { user: "Traveler", guide: "Tour guide", "lead-guide": "Lead guide", admin: "Admin" }

// The account page's look (Kareem's pick of three, 2026-11-21): your account is your passport,
// lying open on the table. The photo page holds your photo and your details, the facing page
// your password. A physical object, so it stays light at night (data-theme="light"), like the
// login postcard and the tour page's journal.
// lg+: a spread, the two pages side by side, tilted a little. Below that, the pages stack inside
// the cover.
// It opens as the page appears: the closed cover lifts away (FrontCover), and on lg+ the photo
// page's half comes down on the other side of the spine (Half).
export function Passport({ user }: { user: User }) {
  return (
    <div className="mt-10 lg:mt-14">
      {/* The cover: navy around the pages, in two halves (Half), because the photo page's half
          swings open on its own. Behind them, a plate in the cover's shape (Plate) casts the
          shadow, and fills the hairline where the halves meet. While the passport opens on lg+,
          only the closed half has one: the second plate, which takes the first one's place until
          the left half lands (cover-full and cover-half in globals.css).
          --fold-depth: how far away you watch the opening from (its perspective), 3.5 times as
          far as what turns is wide: the whole cover below lg, a half on lg+. It's in cqw (% of
          the cover's width: the cover is a container), so it looks the same at every width. */}
      <div
        data-theme="light"
        className="@container relative grid text-foreground [--fold-depth:350cqw] lg:rotate-[-0.8deg] lg:grid-cols-2 lg:[--fold-depth:175cqw]"
      >
        <Plate className="rounded-[15px] lg:rounded-[21px] lg:motion-safe:animate-cover-full" />
        <Plate className="invisible left-[calc(50%+1px)] rounded-r-[21px] max-lg:hidden lg:motion-safe:animate-cover-half" />

        <Half side="left">
          <Page side="left" number={2}>
            {/* The page's printed heading. Screen readers get "Your details" instead. */}
            <div aria-hidden className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-extrabold tracking-[0.3em] text-navy-600 uppercase">
                Passport
              </span>
              <span className="flex items-center gap-1.5 font-display text-base font-bold tracking-[0.08em] uppercase">
                <Logo className="size-4.5" />
                Vantage
              </span>
            </div>
            <h2 className="sr-only">Your details</h2>
            {/* The photo beside the form once the page is at least 24rem wide inside (@sm: the
              page is a container), which leaves the fields room for a long email. On phones
              they'd be too thin (an email got cut off at 375px), so the photo sits above. */}
            <div className="mt-5 grid items-start gap-4 lg:mt-6 lg:gap-6 @sm:grid-cols-[auto_minmax(0,1fr)]">
              <IdPhoto user={user} />
              <DetailsForm name={user.name} email={user.email}>
                <dl>
                  <dt className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Role
                  </dt>
                  <dd className="mt-1 font-semibold">{ROLES[user.role]}</dd>
                </dl>
              </DetailsForm>
            </div>
            {/* mt-auto: the code line sits at the bottom of the page, however tall the form is */}
            <p
              aria-hidden
              className="mt-auto overflow-hidden pt-7 font-mono text-xs tracking-[0.12em] whitespace-nowrap text-navy-900/60 lg:text-sm"
            >
              {machineLine(user.name)}
            </p>
          </Page>
        </Half>

        <Half side="right">
          <Page side="right" number={3}>
            <h2 className="text-[11px] font-extrabold tracking-[0.3em] text-navy-600 uppercase">
              Password
            </h2>
            <div className="mt-3">
              <PasswordForm email={user.email} />
            </div>
            <InkStamp />
          </Page>
        </Half>

        {/* Over both halves: the closed cover, until it lifts away */}
        <FrontCover />

        <TripsTab />
      </div>
    </div>
  )
}

// The cover's shape behind the halves: its navy, its shadow and, at night, a faint ring that keeps
// the cover apart from the dark page. 1px smaller all around, with corners 1px tighter, so only
// the halves draw the cover's edge (smoothed twice, it looked bolder); the ring is 3px, 1px of it
// under the halves. dark: still applies inside data-theme="light" (it asks about <html>).
function Plate({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-px bg-navy-800 shadow-xl dark:ring-3 dark:ring-white/15 ${className}`}
    />
  )
}

// One half of the cover: a page with navy around it. Below lg the halves stack: the top one is
// rounded at the top, the bottom one at the bottom, and each has 5px of navy between the pages.
// lg+ they sit side by side, with no navy at the spine, where the pages meet. `grid`: the page
// fills the half, so both pages are as tall as the taller one. `relative`: it paints over the
// plates (a positioned box paints over the positioned ones before it).
// lg+, the left half opens (cover-drop in globals.css): as the page appears, it stands on its
// edge at the spine (origin-right), hidden, until the cover has lifted; then it comes down flat.
function Half({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  const shape =
    side === "left"
      ? "rounded-t-2xl pb-1.25 lg:rounded-l-[22px] lg:rounded-tr-none lg:pr-0 origin-right lg:motion-safe:animate-cover-drop"
      : "rounded-b-2xl pt-1.25 lg:rounded-r-[22px] lg:rounded-bl-none lg:pl-0"

  return <div className={`relative grid bg-navy-800 p-2.5 lg:p-3 ${shape}`}>{children}</div>
}

// The passport, closed: its navy front cover, printed in gold like a real one (the place, a
// crest, "Passport", and the chip mark). It lies over the whole passport below lg, and over the
// right half on lg+, where the closed passport is half as wide. As the page appears it lifts away
// (cover-lift in globals.css): it turns on its left edge, toward you, until it stands on that
// edge, where it can't be seen anymore. On lg+ that edge is the spine, and it turns on its
// middle (origin-left), like the photo page's half (origin-right), which then comes down on the
// other side (Half): together, one cover opening. Below lg it turns on its top-left corner
// (origin-top-left), so as it comes toward you it only grows downward: turning on the middle of
// its edge, it grew up over the greeting and "Log out" too.
// Below lg the art starts near the top (gap-14), where it's on a phone's first screen.
// It's hidden (invisible) whenever it isn't lifting: afterward, and with reduced motion.
// Decoration.
function FrontCover() {
  return (
    <div
      aria-hidden
      className="pointer-events-none invisible absolute inset-0 flex origin-top-left flex-col items-center gap-14 rounded-2xl bg-navy-800 pt-14 pb-10 text-sun-300 motion-safe:animate-cover-lift lg:left-1/2 lg:origin-left lg:justify-between lg:gap-0 lg:rounded-l-none lg:rounded-r-[22px] lg:py-14"
    >
      {/* Wide letter spacing also adds a gap after the last letter; the same gap before the
          first one (pl) keeps each word centered */}
      <span className="pl-[0.4em] font-display text-base font-bold tracking-[0.4em] uppercase">
        Vantage
      </span>
      <span className="flex flex-col items-center gap-5">
        <Crest />
        <span className="pl-[0.3em] font-display text-3xl tracking-[0.3em] uppercase">
          Passport
        </span>
      </span>
      <ChipMark />
    </div>
  )
}

// The cover's crest: the logo's sunset as a gold stamp (the sun half set on the sea, with
// rays), inside two rings
function Crest() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className="size-24 lg:size-32"
    >
      <circle cx="40" cy="40" r="37" strokeWidth="2" />
      <circle cx="40" cy="40" r="32" />
      <path d="M27 46a13 13 0 0 1 26 0Z" fill="currentColor" stroke="none" />
      <path
        d="M40 29v-5M48.5 31.3l2.5-4.3M54.7 37.5l4.3-2.5M31.5 31.3l-2.5-4.3M25.3 37.5l-4.3-2.5"
        strokeWidth="2"
      />
      <path
        d="M16 46h48M20 52q5-2.5 10 0t10 0t10 0t10 0M28 58q3-1.5 6 0t6 0t6 0t6 0"
        strokeWidth="1.6"
      />
    </svg>
  )
}

// The mark on the cover of a passport with a chip inside
function ChipMark() {
  return (
    <svg viewBox="0 0 40 26" fill="none" stroke="currentColor" strokeWidth="2" className="w-10">
      <rect x="1" y="1" width="38" height="24" rx="4" />
      <circle cx="20" cy="13" r="6" />
      <path d="M1 13h13M26 13h13" />
    </svg>
  )
}

// One page: the printed paper (passport-paper in globals.css), with its number at the outer
// corner. On the spread each page darkens toward the spine, where the paper curves into the
// binding (an inset shadow on that side). It's a container (@container), so what's inside can
// ask how wide the page is, not the screen.
function Page({
  side,
  number,
  children,
}: {
  side: "left" | "right"
  number: number
  children: ReactNode
}) {
  const spread =
    side === "left"
      ? "lg:rounded-l-xl lg:rounded-r-sm lg:shadow-[inset_-30px_0_30px_-24px_rgb(0_34_68/0.35)]"
      : "lg:rounded-l-sm lg:rounded-r-xl lg:shadow-[inset_30px_0_30px_-24px_rgb(0_34_68/0.35)]"

  return (
    <div
      className={`@container relative flex min-w-0 flex-col overflow-hidden rounded-[10px] passport-paper px-5 pt-5 pb-9 lg:min-h-130 lg:px-8 lg:pt-7 lg:pb-11 ${spread}`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute bottom-3 text-[11px] text-muted-foreground ${side === "left" ? "left-4" : "right-4"}`}
      >
        {number}
      </span>
    </div>
  )
}

// Your photo, printed into the page like on a real passport, not pasted on (Kareem's pick of
// four looks, 2026-11-22): muted color, edges fading into the paper, security marks printed
// over it, a hologram seal on its corner, and a small faded gray copy (a "ghost image"): beside
// it on phones, under it once the photo sits beside the form (@sm). With no photo yet, your
// first letter, printed the same way on a patch of sun yellow. Decoration: your name is right
// beside it, in the form. The CSS pieces (print-fade and the rest) are in globals.css.
// - mix-blend-multiply mixes the print with the paper under it, like ink: white parts take the
//   paper's color, and its rings show through the light parts. It only mixes with what's
//   behind it in the same stacking context, so nothing between the print and the page may get
//   an opacity, a transform or a filter, or the print stops mixing with the paper. The page
//   itself is fine: as a container it's already one, with the paper inside.
// - The copy asks for the same `sizes` as the photo, so the browser picks the same file and
//   downloads nothing new, even though the copy shows smaller.
function IdPhoto({ user }: { user: User }) {
  return (
    <div
      aria-hidden
      className="flex items-end gap-5 lg:gap-6 @sm:flex-col @sm:items-center @sm:gap-4.5"
    >
      <div className="relative w-24 shrink-0 lg:w-34">
        <div className="relative aspect-4/5 print-fade mix-blend-multiply">
          {user.photo ? (
            <Image
              src={user.photo}
              alt=""
              fill
              loading="eager"
              sizes={PHOTO_SIZES}
              className="object-cover brightness-105 saturate-50 sepia-20"
            />
          ) : (
            <span className="grid size-full place-items-center bg-sun-300/35 font-display text-5xl font-bold text-navy-900 uppercase lg:text-6xl">
              {user.name[0]}
            </span>
          )}
          <span className="absolute inset-0 print-dots" />
          <span className="absolute inset-0 security-lines" />
        </div>
        <span className="absolute -right-3 -bottom-3 size-11 hologram opacity-75 lg:-right-4.5 lg:-bottom-4.5 lg:size-15" />
      </div>
      {user.photo && (
        <div className="relative aspect-4/5 w-11 shrink-0 opacity-45 mix-blend-multiply ghost-fade lg:w-14">
          <Image
            src={user.photo}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className="object-cover brightness-110 contrast-115 grayscale"
          />
        </div>
      )}
    </div>
  )
}

// How wide the photo shows (the photo box: w-24, lg:w-34), so the browser picks the right file
const PHOTO_SIZES = "(min-width: 1024px) 136px, 96px"

// A faded ink stamp on the password page, like one from a trip long ago, in the empty corner
// under the form (clear of the page number). Decoration, desktop only: on a phone it would sit on
// the button.
function InkStamp() {
  return (
    <span
      aria-hidden
      className="absolute right-10 bottom-8 hidden size-32 rotate-[-14deg] place-items-center rounded-full border-4 border-double border-coral-600 text-center font-display font-bold text-coral-600 uppercase opacity-25 lg:grid"
    >
      <span className="leading-tight">
        <span className="block text-[11px] tracking-[0.3em]">Vantage</span>
        <span className="block text-2xl">★</span>
        <span className="block text-[11px] tracking-[0.3em]">Summer</span>
      </span>
    </span>
  )
}

// A bookmark tab for the page of trip stamps that comes with bookings (phase 5). lg+: it sticks
// out of the cover's right edge, written sideways; below that, a small sticker on top. Decoration.
function TripsTab() {
  return (
    <span
      aria-hidden
      className="absolute -top-3.5 right-5 rotate-3 rounded-lg border-2 border-navy-950 bg-sun-300 px-3 py-0.5 font-hand text-lg text-navy-950 shadow-[3px_3px_0_rgb(0_34_68/0.25)] lg:top-16 lg:-right-10 lg:rotate-0 lg:rounded-l-none lg:rounded-r-[10px] lg:border-l-0 lg:py-3.5 lg:pr-2 lg:pl-3.5 lg:[writing-mode:vertical-rl]"
    >
      trips · soon
    </span>
  )
}

// The code line printed at the bottom of a passport's photo page, made from your name the way a
// real one is: "P<", the country (VTG, for Vantage), your last name, "<<", your other names joined
// by "<", then "<" up to 44 characters. Only A to Z: accents are dropped (é becomes E) and
// anything else becomes a gap. Decoration: screen readers skip it.
function machineLine(name: string) {
  const words = name
    .normalize("NFD") // splits é into e plus its accent…
    .replace(/[̀-ͯ]/g, "") // …and this drops the accent
    .toUpperCase()
    .replace(/[^A-Z]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
  const last = words.pop() ?? ""
  return `P<VTG${last}<<${words.join("<")}`.padEnd(44, "<").slice(0, 44)
}
