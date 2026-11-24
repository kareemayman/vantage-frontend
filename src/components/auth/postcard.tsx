import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Logo } from "@/components/logo"
import type { Tour } from "@/lib/tours"

type PostcardProps = {
  tour?: Tour // its photo is the postcard's front, peeking out behind it (none: no photo)
  titleId: string // the title's id, so the page's <section> can name itself after it
  title: string
  // A title with long words ("Forgot your password?"). On phones it wraps before the stamp
  // instead of running under it, and gets a little smaller below ~370px wide, so its longest
  // word fits (measured: "PASSWORD?" is 183px, and a 320px phone has 161px beside the stamp).
  // Its two or three lines push the note below the stamp, so the note can use the full width.
  longTitle?: boolean
  note: string // handwritten, lowercase
  footer: ReactNode // e.g. "New here? Create an account"
  wide?: boolean // a wider card, for a longer form (signup)
  children: ReactNode // the form
}

// lg+: the card's width, and the room around it for the photo to peek out from behind it.
// Signup's four fields made a tall, narrow card (Kareem: wider looks better), so a wide card is
// 900px from 1280px, in a layout widened to match. Below 1280 there's no room for a wider card
// without covering the photo's label (an 800px card cut "greetings from utah" at 1024), so it
// stays 720px there, like login's.
const SIZES = {
  normal: { card: "lg:w-180", room: "lg:max-w-5xl" },
  wide: { card: "lg:w-180 xl:w-225", room: "lg:max-w-5xl xl:max-w-6xl" },
}

// The entrance, as the page appears: the photo is dropped onto the table (drop-in), then the
// postcard slides over it (slide-over), starting CARD_AT seconds in, as the photo comes down
const CARD_AT = 0.3

// The login and signup pages' look (Kareem's pick of three, 2026-11-14): the form written on the
// back of a postcard, with a stamp and a postmark, and the card's front, a tour photo, peeking
// out behind it. A physical object, so it stays light at night (data-theme="light"), like the
// tour page's journal.
// Phones and tablets: the card stands up, with the photo peeking out above it. lg+: a landscape
// card, the message on the left, a line, the form on the right under the stamp, and the photo
// tilted behind its left half.
export function Postcard(props: PostcardProps) {
  const { tour, titleId, title, longTitle, note, footer, wide, children } = props
  const size = SIZES[wide ? "wide" : "normal"]

  return (
    <div className={`relative mx-auto max-w-md pt-24 lg:pt-10 ${size.room}`}>
      {tour && <PhotoCard tour={tour} />}

      {/* The back. lg: two columns; the form spans all five rows of the right one, and the
          left one holds the title, the note, the footer, a pencil doodle in the room that's
          left, and at its bottom a printed caption about the photo, like a real postcard's.
          The HTML order (title, note, form, footer, doodle, caption) is the phone layout and
          the reading order.
          It slides in from the side away from the photo (--slide-from): from below on phones,
          from the right on desktop. data-postcard: the box that sent: (globals.css) and
          usePostmark look in. */}
      <div
        data-theme="light"
        data-postcard
        style={{ animationDelay: `${CARD_AT}s` }}
        className={`relative rotate-1 rounded-md bg-white p-6 text-foreground shadow-xl [--slide-from:0_25%] motion-safe:animate-slide-over lg:ml-auto lg:grid lg:min-h-120 lg:rotate-[1.8deg] lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_1fr_auto] lg:gap-x-9 lg:p-10 lg:[--slide-from:22%_4%] ${size.card}`}
      >
        <Stamp />
        {/* longTitle: 4.5rem is the stamp's corner, measured, plus a few px */}
        <h1
          id={titleId}
          className={`font-display leading-none font-bold tracking-tight uppercase lg:max-w-none lg:text-5xl ${longTitle ? "max-w-[calc(100%-4.5rem)] text-[min(2.375rem,10.25vw)]" : "text-[2.375rem]"}`}
        >
          {title}
        </h1>
        {/* Phones: beside a short title, the note wraps before the postmark, whose ring starts
            about 7.5rem from the right edge of the card's content (measured), so 8.5rem keeps at
            least 15px between them at any width. A fixed 11rem ran into the ring below 375px
            wide. Under a long title, it's already below the stamp. */}
        <p
          className={`mt-2 font-hand text-2xl text-pretty text-navy-800 lg:mt-4 lg:max-w-none lg:text-[1.75rem] ${longTitle ? "" : "max-w-[min(11rem,calc(100%-8.5rem))]"}`}
        >
          {note}
        </p>
        {/* lg: the line down the middle is this column's left border; pt-28 leaves the stamp
            its corner */}
        <div className="mt-5 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:mt-0 lg:border-l-2 lg:border-navy-200 lg:pt-28 lg:pl-9">
          {children}
        </div>
        <div className="mt-6 text-center lg:col-start-1 lg:row-start-3 lg:mt-8 lg:text-left">
          {footer}
        </div>
        <Doodle />
        {tour && (
          <p className="mt-3 text-center text-sm text-muted-foreground lg:col-start-1 lg:row-start-5 lg:mt-0 lg:text-left">
            On the front:{" "}
            <Link
              href={`/tours/${tour.slug}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {tour.name}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

// A pencil doodle in the message side's empty middle (Kareem's pick on 2026-11-15, over a list of
// what an account is for, and over splitting the form across both sides): the little plane
// looping over a palm on an island, two gulls, and the sun low over the sea. Pencil gray, like
// the tour page's map; the plane is the globe's drawing (globe.tsx), as an outline. Desktop
// only: on phones the card is one column, with no empty side. It fills the row's width and
// sits in the middle of the room left. Decoration, so screen readers skip it.
function Doodle() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 220"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="my-6 hidden w-full stroke-neutral-500 lg:col-start-1 lg:row-start-4 lg:block lg:self-center"
    >
      {/* The sea: three wavy lines, shorter as they go down */}
      <path d="M8 172q11-6 22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0" />
      <path d="M46 190q11-6 22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0" />
      <path d="M96 207q11-6 22 0t22 0t22 0t22 0t22 0t22 0" />
      {/* The island, and the palm: a bending trunk with its rings, five fronds with a few
          leaf ticks, and two coconuts hanging on either side of the trunk */}
      <path d="M30 170Q72 146 118 170" />
      <path d="M70 160Q66 124 86 86" />
      <path d="M65 148l7 2M65 136l7 1M67 124l7 1M70 112l7 1M74 101l6 2" />
      <path d="M86 86q-26-14-46 4M86 86q-18-30-48-24M86 86q2-32 30-38M86 86q30-12 48 8M86 86q22 2 30 28" />
      <path
        d="M60 80l-4 6M52 70l-3 6M100 62l1 7M110 56l1 7M118 82l-3 6M128 88l-4 5"
        strokeWidth="1.5"
      />
      <circle cx="78" cy="95" r="3.5" />
      <circle cx="93" cy="94" r="3.5" />
      {/* The sun, low over the sea, with short rays */}
      <path d="M226 172a26 26 0 0 1 52 0" />
      <path d="M252 132v10M224 142l6 7M280 142l-6 7M212 164l9 2M292 164l-9 2" />
      {/* Two gulls */}
      <path d="M176 112q5-5 10 0q5-5 10 0M200 98q4-4 8 0q4-4 8 0" strokeWidth="1.6" />
      {/* The plane's trail: in from the right, one loop, then along to the plane (dots: a
          dash shorter than a pixel, with round caps) */}
      <path
        d="M312 70C290 72 268 70 252 58C238 47 240 26 256 28C270 30 266 54 246 60C222 67 196 58 172 52"
        strokeDasharray="0.5 7"
      />
      {/* The plane, facing left (scale -0.2 flips the drawing), tilted a little nose up.
          Its lines are 9 wide before the scale, so about 1.8 here. */}
      <g
        transform="translate(166 52) rotate(-8) scale(-0.2 0.2) translate(-121 -65)"
        strokeWidth="9"
      >
        <path d="M38 58L22 18Q20 12 28 12L48 12Q54 12 58 20L74 52Z" />
        <path d="M30 60Q30 44 52 44L170 44Q214 44 222 66Q214 86 172 86L54 86Q30 86 30 70Z" />
        <path d="M100 70L142 70L120 112Q116 118 108 118L98 118Q90 118 93 111Z" />
      </g>
    </svg>
  )
}

// The postcard's front: the tour's photo in a white border, tilted behind the card. Its place is
// handwritten on a cream label stuck to the photo: dark ink on cream reads on any photo (Kareem
// asked for a caption that's always clear), where ink straight on a bright sky could vanish.
// Decoration (the form is what matters), so screen readers skip it.
// The outer box has the place and the tilt, the inner one the white border and the drop
// (drop-in, 10% bigger at first, like the journal's cover photo), so the drop's turn adds to
// the tilt.
function PhotoCard({ tour }: { tour: Tour }) {
  const place = tour.startLocation.description.split(",")[0] // "Banff, CAN" → "Banff"

  return (
    <div
      aria-hidden
      data-theme="light"
      className="absolute top-0 left-2 aspect-7/5 w-[70%] -rotate-8 lg:left-0 lg:w-135 lg:-rotate-7"
    >
      <div className="size-full bg-white p-2.5 shadow-lg [--drop-from:1.1] motion-safe:animate-drop-in lg:p-3">
        {/* @container: the label below is sized from this box's width (cqw) */}
        <div className="@container relative size-full overflow-hidden rounded-xs bg-sand-100">
          {/* eager: it's the biggest thing on the first screen (the page's LCP) */}
          <Image
            src={tour.imageCover}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 1024px) 516px, (min-width: 496px) 294px, calc(70vw - 54px)"
            className="object-cover"
          />
          {/* Its size follows the photo's width: 10% of it, at most 20px (24px at lg). On a
              320px phone the photo is 170px wide, and at a fixed 20px "greetings from banff"
              took two lines there and covered most of the photo that shows (measured: 17px
              fits). /[1.4] is the line height text-xl had. */}
          <span className="absolute top-2.5 left-2.5 -rotate-3 rounded-sm bg-sand-50 px-2.5 pb-0.5 font-hand text-[min(1.25rem,10cqw)]/[1.4] text-navy-950 lowercase shadow-sm lg:top-4 lg:left-4 lg:text-2xl">
            greetings from {place}
          </span>
        </div>
      </div>
    </div>
  )
}

// The stamp in the card's top-right corner (the logo on a perforated stamp: the `perforated`
// utility in globals.css; the postmark already says "VANTAGE", so the stamp has no words), and a
// postmark over its left edge. The shadow is on a wrapper, because a mask also cuts away the
// masked element's own shadow. Decoration.
function Stamp() {
  return (
    <div aria-hidden className="absolute top-5 right-5 lg:top-8 lg:right-9">
      <div className="drop-shadow-sm">
        <div className="w-17.5 bg-white p-1.5 perforated lg:w-22">
          <div className="grid aspect-5/6 place-items-center bg-linear-to-b from-sky-200 to-sand-200">
            <Logo className="size-10 lg:size-13" />
          </div>
        </div>
      </div>
      {/* The postmark: the stamp stays clean until the form has gone through, then the
          postmark thunks down onto it (sent:, see Postmark). The tilt is on this box, so the
          thunk's turn adds to it. data-postmark: usePostmark brings it into view and waits
          for it to land.
          top-9 below 360px wide: there, "SIGN UP" reaches under the ring, so the ring sits
          lower, under the title's line */}
      <div
        data-postmark
        className="absolute top-9 -left-14 w-32 -rotate-12 min-[360px]:top-5 lg:top-6 lg:-left-16 lg:w-44"
      >
        <Postmark />
      </div>
    </div>
  )
}

// A postmark: a round "VANTAGE · SUMMER" mark in faded ink, with wavy lines running off to the
// right, across the stamp. Hidden until the form is sent; then a rubber stamp slams it down
// (stamp-on). With reduced motion it just appears.
function Postmark() {
  return (
    <svg
      viewBox="0 0 200 110"
      fill="none"
      className="invisible block w-full sent:visible motion-safe:sent:animate-stamp-on"
    >
      <g className="stroke-navy-900/50">
        <circle cx="55" cy="55" r="48" strokeWidth="3" />
        <circle cx="55" cy="55" r="41" strokeWidth="1.5" />
        <path
          d="M104 38q12-8 24 0t24 0t24 0t24 0M104 55q12-8 24 0t24 0t24 0t24 0M104 72q12-8 24 0t24 0t24 0t24 0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g textAnchor="middle" className="fill-navy-900/60 font-display text-[13px] tracking-[0.2em]">
        <text x="57" y="43">
          VANTAGE
        </text>
        <text x="55" y="61">
          ★ ★ ★
        </text>
        <text x="57" y="79">
          SUMMER
        </text>
      </g>
    </svg>
  )
}
