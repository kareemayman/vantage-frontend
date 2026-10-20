@AGENTS.md

# Vantage — Frontend

Frontend for **Vantage**, a tour-booking platform and Kareem's first full-stack (MERN) project. Two goals: learn modern frontend deeply, and ship a portfolio piece impressive enough for LinkedIn, with storytelling, playful 3D, and easter eggs, without sacrificing accessibility or performance.

- **This repo** (`kareemayman/vantage-frontend`): the Next.js app, scaffolded with `create-next-app` (TypeScript, ESLint, Tailwind, `src/`, App Router, React Compiler, `@/*` alias).
- **API**: sibling folder `../backend` (GitHub: `kareemayman/vantage-backend`, renamed from `natours-backend`), Express 5 + Mongoose 9 on MongoDB Atlas. It is the source of truth for endpoints and data shapes: read the route and controller before integrating an endpoint, because the summary below can lag behind.
- **History**: Kareem hand-wrote the API (no AI) while following Jonas Schmedtmann's _Node.js, Express, MongoDB & More_ bootcamp ("Natours"), modernizing it along the way (Express 5 async errors, jose, Resend, Mongoose 9). The course's Pug SSR frontend was dropped on purpose; this repo replaces it with a summer/travel identity.

## Working with Kareem

**This project exists for Kareem to learn.** Shipping something impressive matters, but understanding comes first.

- Frontend dev with ~2 years of React (knows Redux Toolkit, has used TypeScript), newly comfortable with Node/Express/MongoDB.
  - **Has used before, but not recently:** Next.js (never its advanced features) and Tailwind. Refresh these quickly instead of teaching from zero, but fully explain anything new since then: the App Router, Server Components and Server Actions, Next's caching, Tailwind v4's CSS-first config.
  - **Brand new:** Zustand, Zod, GSAP, Lenis, three.js/R3F, physics engines, native `<dialog>`/popover, shadcn/ui.
- **Collaboration mode: Claude writes the code, in small steps, explaining everything.**
- **Keep explanations short and simple.** Kareem loses focus with long text, and he has said that over-complicated explanations lose him. Use plain English: short sentences, everyday words, one idea at a time, no jargon. Still teach every new concept with a tiny example, ideally next to code he already writes (`useState` + `useEffect`, Redux).
- **Before every step, say what you're about to do and why** (a few sentences). Then do it. Then explain what changed.
- **Explain every new tool, API, or concept the first time it appears**: what it is, what problem it solves, how it works (with a minimal example), how it maps to something Kareem already knows (React SPA, Redux, Express; e.g. "`proxy.ts` is Next's version of Express middleware"), and the main alternative. Never introduce a library or pattern silently.
- **Keep it simple; don't overengineer.** Pick the simplest approach that works. Add abstractions, folders, or libraries only when a concrete need shows up, and say when something is optional. If a pattern is "industry best practice" but overkill for this project, say so and skip it.
- After writing code, walk through the non-obvious lines and link the official docs.
- One concept or feature per step; no large unexplained scaffolds. Pause after a new concept so Kareem can ask questions.
- At decision points, stop and ask, leading with a recommendation.
- If Kareem wants to write a part personally, give hints and review instead of handing over the solution.
- **Don't edit backend code.** Kareem writes all of `../backend` as practice; Claude only mentors there (see `../backend/CLAUDE.md`). The one exception is the checklist in `../backend/CLAUDE.md`, which Claude may update when asked. Never print secret values from `../backend/config.env`.
- Ask before adding dependencies.
- **Git is Kareem's job.** Never commit or push, and don't ask about committing. Kareem's commit style, if a message is ever requested: `type(scope): description`, e.g. `feat(tour card): show next start date`.

## Creative vision (as important as the features)

The "cool factor" is a core requirement, not end-of-project polish. Storytelling, easter eggs, and playful 3D sit right next to the booking features. On every page, look for a delightful, on-theme way to present the content, and pitch ideas: Kareem explicitly wants Claude's creative input.

- **Art direction:** cartoonish, rendered 3D objects (beach balls, planes, palm trees, clouds, suitcases) animated with personality: squash and stretch, bounces, wobbles. Not flat stock illustrations.
- **Copy: playful but plain.** Use everyday words, and no puns or travel jargon that need explaining. Kareem found the design's "we're taxiing" and Claude's "tagged and ready for takeoff" confusing, and picked "the beach is this way →" and "where to first?" instead. Handwritten notes are lowercase. When writing new copy, offer a few plain options and recommend one.
- **Scrolling is the storytelling:** Lenis smooth scroll everywhere, pinned horizontal-scroll sections at key moments (e.g. a tour's day-by-day itinerary), and content revealed in clever ways, not just fade-ups.
- **Loading screen:** a three.js cartoon plane flying from point A to point B for route loading. It doubles as the Render cold-start wait.
- **Playground and mini-games:** a beach ball you can grab, throw, and bounce; a small pool it can splash into and float in; mini-games with a score (e.g. beach volleyball, keep-it-up).
  - Inspiration Kareem shared: an interactive jelly watermelon you can drag and slice. It uses WebGPU plus a custom soft-body physics engine, which is far beyond what we need.
  - Our version: rigid-body physics with Rapier (`@react-three/rapier`), plus faked squash and stretch.
- **More ideas:**
  - a 3D globe with flight arcs between tour start locations;
  - a plane flying an SVG path as you scroll (GSAP MotionPath);
  - a map camera that `flyTo()`s from day to day as you scroll an itinerary;
  - the booking confirmation as an animated boarding pass;
  - Konami-code and hidden-sun easter eggs.
- **Homepage spec:** `design/HANDOFF.md` (sections, interactions, theme switching, 3D asset list), with `design/pages/*.html` for exact values and `design/screenshots/` as the visual target. These are reference files: never edit them (they're in `.prettierignore`). Rebuild them fluidly, not with their fixed pixel positions.
- **Guardrails:** every effect has a reduced-motion and low-power fallback, content stays readable and reachable without the toys, and 3D is lazy-loaded.

## Architecture

```
Browser ──▶ Next.js server on Vercel ──(server-to-server)──▶ Express API on Render ──▶ MongoDB Atlas
   └──────▶ Cloudinary CDN (images; the API stores Cloudinary public IDs)
```

- **The API owns business logic, validation, and data.** Next.js is the presentation layer plus a thin BFF (session cookie, data fetching, caching). Don't duplicate API rules in Next.js beyond client-side form validation.
- **Auth: BFF pattern (decided).** Signup, login, resetPassword, and updateMyPassword return a JWT in the JSON body. A Server Action stores it in a first-party httpOnly cookie on the Next.js domain; server-only code forwards it as `Authorization: Bearer <token>` (the API's `protect` reads only that header). The token never reaches client JS, no CORS is needed, and the backend needs no auth changes.
  - Rejected: the API's own `jwt` cookie (third-party across `*.vercel.app` → `*.onrender.com`, blocked by Safari, invisible to the Next server, and `protect` never reads it); token in `localStorage` + Bearer from the browser (readable by any injected script, and the Next server can't see it, so no server-rendered logged-in UI).
  - JWTs live 2h (`JWT_EXPIRES_IN=2h`) with no refresh tokens: match the cookie's `maxAge`, and on a 401 clear the cookie and send the user to login.
  - `updateMyPassword` and `resetPassword` return a **new** token and invalidate the old one, so always replace the cookie.
  - Route protection: optimistic cookie check in `proxy.ts`, real check in the server data layer.
- All API calls live in server-only modules (`import "server-only"`). `API_URL` is a server env var, never `NEXT_PUBLIC_`.
- **Caching**: public data (tours, reviews, stats) is cached on the Next side with `"use cache"` + `cacheTag`/`cacheLife`. Anything that reads cookies or user data is never cached across users.
- **Render's free tier sleeps after 15 min idle; the next request takes ~30–60 s.** Cached public pages must render without the API, live calls need a themed wait state (the plane loading screen), and a warm-up ping on first visit is worth considering.

## Stack

Install nothing marked _proposed_ until Kareem confirms it. Versions live in `package.json` (Next 16.3.8, React 19.2.8 at scaffold time).

| Concern | Choice | Status |
| --- | --- | --- |
| Framework | Next.js 16.3, App Router, Turbopack, React 19 | decided |
| Language | TypeScript, strict | decided |
| Compiler | React Compiler (`reactCompiler: true`): automatic memoization, no manual `useMemo`/`useCallback` | decided |
| Caching model | `cacheComponents: true` (explicit `"use cache"`, the future default); turn on when we first fetch API data | proposed |
| Styling | Tailwind CSS v4: tokens in `@theme` inside `globals.css`, no `tailwind.config` | decided |
| Components | Hybrid: hand-build simple components (Button, Input, Card, Badge, Navbar, modals on native `<dialog>`); shadcn/ui only for complex accessible widgets (date picker, select, dropdown menu, toast), restyled to Vantage tokens. Explain what each shadcn component handles before adding it. | decided |
| Client state | Zustand, for UI/experience state only (see Conventions) | decided |
| Server data | Server Components + Server Actions; TanStack Query only if a feature needs client-side caching or polling | proposed |
| Forms | Zod schemas mirroring the Mongoose validators + `useActionState`; React Hook Form only for complex forms | proposed |
| Animation | GSAP (ScrollTrigger, SplitText, MotionPath) + `@gsap/react` for the scroll story and horizontal sections; Motion (`motion/react`) for UI, layout and page transitions | GSAP installed (3.15), Motion proposed |
| Smooth scroll | Lenis 1.3, driven by GSAP's ticker (`src/components/smooth-scroll.tsx`). Plain `lenis` for now; `lenis/react` adds a `useLenis()` hook if a component ever needs the instance | installed |
| 3D | three.js via React Three Fiber + drei | three.js decided, R3F proposed |
| Physics | Rapier via `@react-three/rapier` (beach ball, pool, mini-games) | proposed |
| Maps | MapLibre GL via `react-map-gl` + OpenFreeMap vector tiles (free, no API key, restylable to the palette, smooth `flyTo`). Chosen over Leaflet (simpler, but raster tiles can't be recolored). | decided |
| Images | Cloudinary (+ `next-cloudinary`) | decided |
| Payments | Stripe Checkout in test mode (available to Kareem) | decided, phase 5 |
| Tooling | npm; ESLint (scaffolded); Prettier + `prettier-plugin-tailwindcss` (sorts Tailwind classes) | decided |
| Testing | Vitest + Testing Library; Playwright for key flows | later |
| Hosting | Vercel Hobby (frontend), Render free tier (API), MongoDB Atlas (DB) | decided |

## Backend API (summary)

Base path `/api/v1`. Local: `cd ../backend && npm run dev`. The port comes from `config.env` and is currently 3000, which collides with Next's default (backend checklist item 0). Protected routes need `Authorization: Bearer <jwt>`.

| Method | Path | Access | Success payload |
| --- | --- | --- | --- |
| GET | `/tours` | public | `results`, `data.docs: Tour[]` |
| GET | `/tours/:id` | public | `data.doc: Tour` (guides populated, **no reviews**) |
| POST/PATCH/DEL | `/tours`, `/tours/:id` | admin, lead-guide | bare `data: Tour`; 204 on delete |
| GET | `/tours/stats` | public | `data.stats: [{ toursCount, totalRatings, avgRating, avgPrice, minPrice, maxPrice }]`: one group over tours rated ≥ 4.5 (`getTourStats`) |
| GET | `/tours/tours-within/:distance/center/:latlng/unit/:unit` | public | `results`, `data.tours` (`latlng` = `lat,lng`, `unit` = `mi` or `km`) |
| GET | `/tours/distances/:latlng/unit/:unit` | public | `data.distances: { name, distance }[]` |
| GET | `/tours/:tourId/reviews` | **logged in** | `results`, `data.reviews` (user populated: name, photo) |
| POST | `/tours/:tourId/reviews` | role `user` only | `data.review`; body `{ review, rating }`; one review per user per tour |
| GET | `/reviews`, `/reviews/:id` | logged in | `data.reviews` (tour populated); `data.doc` |
| PATCH/DEL | `/reviews/:id` | admin, user | bare `data: Review`; 204 on delete |
| POST | `/users/signup` | public | `token`, bare `data: User`; body `{ name, email, password, passwordConfirm }` |
| POST | `/users/login` | public | `token` only (status 201); body `{ email, password }` |
| POST | `/users/forgotPassword` | public | `message`; body `{ email }` |
| PATCH | `/users/resetPassword/:token` | public | `token`; body `{ password, passwordConfirm }` |
| GET | `/users/me` | logged in | `data.doc: User` |
| PATCH | `/users/updateMe` | logged in | `data.user`; only `name` and `email` are accepted |
| PATCH | `/users/updateMyPassword` | logged in | `token`; body `{ currentPassword, password, passwordConfirm }` |
| DELETE | `/users/deleteMe` | logged in | 204 (soft delete) |
| GET/PATCH/DEL | `/users`, `/users/:id` | admin | `data.docs`; `data.doc`; bare `data`; 204 (`POST /users` is a stub, use signup) |

- **Envelope**: `{ status, results?, token?, message?, data? }`, and the payload key varies by endpoint (see table). Branch on the HTTP status (`res.ok`), not the `status` string: it's `"success"` almost everywhere but `"Success"` from updateMe and deleteMe.
- **Errors**: `{ status: "fail" | "error", message }`. In development the raw `error` and `stack` are added, and Mongoose validation, duplicate-key, and cast errors come back as **500** with raw messages; production maps them to 400 with clean messages.
- **Query features** (GET `/tours`, `/users`, `/reviews`): filter `?difficulty=easy&price[lt]=1000` (`gt|gte|lt|lte`); sort `?sort=price,-ratingsAverage` (default `-createdAt`); fields `?fields=name,price,slug`; paginate `?page=2&limit=9` (default limit 100, **no total count**). Look up a tour by slug with `?slug=the-sea-explorer` (returns an array; there's no dedicated endpoint).
- GeoJSON coordinates are `[lng, lat]`, but the geo URLs take `lat,lng`.
- IDs: use `_id`. Tours and reviews also include a virtual `id`; users don't.

**Models** (fields the UI uses):

- **Tour**: `name` (10–40 chars, unique), `slug`, `duration` (days), `durationWeeks` (virtual), `maxGroupSize`, `difficulty` (`easy | medium | difficult`), `ratingsAverage` (defaults to 4.5 even with zero reviews, so show "New" when `ratingsQuantity === 0`), `ratingsQuantity`, `price`, `priceDiscount?`, `summary`, `description` (paragraphs split by `\n`), `imageCover`, `images[]`, `startDates[]`, `startLocation { coordinates, address, description }`, `locations[] { coordinates, description, day }`, `guides[]` (populated users).
- **User**: `name` (4–40), `email`, `role` (`user | guide | lead-guide | admin`), `photo?`. Passwords are at least 8 characters.
- **Review**: `review`, `rating` (1–5), `tour`, `user { name, photo }`. `createdAt` isn't returned.

## Backend fix checklist

It lives in `../backend/CLAUDE.md`. Kareem fixes those items; Claude only mentors there. Before assuming an API problem is fixed, check that file's ticks. The items that change what the frontend can rely on:
- images as Cloudinary public IDs;
- tour stats over every tour, with the true average rating (4b);
- public review reads;
- production error messages;
- the reset link pointing to `FRONTEND_URL/reset-password/:token`;
- bookings;
- deploy prep (`trust proxy`, rate limits).

Until they land, code defensively against the summary above.

## Design system

Theme: summer · travel · sky · beach · planes.

| Token | Hex | Role |
| --- | --- | --- |
| `navy` | `#1D5D9B` | primary: buttons, links, headings, dark sections |
| `sky` | `#75C2F6` | secondary: highlights, illustrations, sky gradients |
| `sun` | `#F4D160` | accent: CTAs, badges, highlights |
| `sand` | `#FBEEAC` | warm surfaces and backgrounds (sand-200; the page background is the lighter sand-50) |

Measured WCAG contrast: white on navy 6.8 ✓, navy on sand 5.8 ✓, navy on sun 4.6 ✓ (just passes AA), navy on sky 3.5 (large text only), white on sky 1.9 ✗, white on sun 1.5 ✗. **Text on sky or sun must be navy or darker, never white.**

**Tokens live in `src/app/globals.css`, and `/design` is the living style guide** (every token in light and dark; add each new component there).

- **Palette** (`@theme static`): 11-step scales (50–950) generated in OKLCH and contrast-checked, with Tailwind's default palette removed (`--color-*: initial`).
  - `navy`, `sky`, `sun`, `sand`; brand hexes at navy-600, sky-300, sun-300, and sand-200.
  - `neutral` (navy-tinted gray), `lagoon` (success green), `coral` (error red).
  - Raw colors are for illustrations, 3D, and art. **Components use semantic tokens.**
- **Semantic tokens** follow shadcn's naming, so shadcn components inherit them:
  - surfaces and text: `background/foreground`, `card`, `popover`, `muted`;
  - actions: `primary`, `secondary`, `cta` (the sun button), `destructive`;
  - `accent` (hover background for menu items);
  - status: `success/warning/info` each plus a `-soft` background, and `destructive-soft`;
  - lines and states: `border`, `input` (3:1 field borders), `ring` (focus), `disabled`, `overlay`;
  - each interactive color has `-foreground` and `-hover`, and primary also has `-active`.
- **Scene and cartoon-UI tokens** (from the handoff):
  - `outline` (bold cartoon borders), `tile`, `chip` / `chip-foreground` / `chip-warm`, `dash`, `night`, `crab`, `nav` / `nav-border`;
  - `scene-sky`, `scene-sky-2`, `scene-sea`, `scene-sand`, `scene-dune`, `scene-cloud`, `scene-cloud-shade`, `scene-ground-shadow`. The `scene-` prefix keeps them apart from palette classes like `bg-sky-50`;
  - `--wave-opacity` is a plain variable with no class.
- **Shadows** are navy-tinted (`shadow-xs`…`shadow-xl`). `shadow-pop` is a hard cartoon "sticker" shadow (navy in light mode, sun in dark mode).
- **Radii and spacing:** Tailwind's defaults for now.
- **Buttons:** `ButtonLink` (`src/components/button.tsx`) for links that look like buttons. Variants: `cta` (the sun sticker, which presses down on click), `outline`, and `primary` (navy; everyday links like "View tour"). Sizes: `sm` (navbar) and `lg` (hero). The "go" arrow on links (`ArrowIcon`) and any other icon used in more than one place live in `src/components/icons.tsx`. There's no class-merging library, so `className` may only add layout (width, margins), never colors or sizes. The exception is a variant-prefixed override (e.g. `short:h-12`), because a variant class always wins over an unprefixed one. A `<button>` version comes with the first form.
- **Dark mode:** light is the default for everyone, and dark is opt-in.
  - Dark values live under `[data-theme="dark"]`. Any element can carry `data-theme="dark"` or `"light"` to theme its subtree (themed sections).
  - `dark:` classes follow `data-theme` via `@custom-variant`, never the OS setting.
  - Prefer semantic tokens over `dark:` classes.
  - **How switching works:**
    - **Theme lives in the DOM, not React state:** `data-theme` on `<html>`.
    - Every switch calls `toggleTheme()` (`src/lib/theme.ts`). It saves to `localStorage` (`vantage-theme`) and runs the "sunset wipe": a View Transitions circle from the clicked button, or an instant swap with reduced motion or in browsers without support.
    - Triggers use `<ThemeToggle labelLight labelDark>` (`src/components/theme-toggle.tsx`), the only Client Component involved. It wraps any children: an icon, the hero sun, footer text.
    - Anything that differs per theme (icons, labels, copy) switches with `dark:` classes, never JavaScript, so server HTML is right for both themes.
    - The root layout runs `themeInitScript` as a plain inline `<head>` script (not `next/script`, which runs too late), so a saved dark theme never flashes light. `<html suppressHydrationWarning>` is required for this.
- **Base styles:** the page uses `background`/`foreground`, the default border color is `border`, every element gets a global `:focus-visible` ring, and text selection is sun-200.
- **Gotcha:** Tailwind only generates classes it finds as complete strings in source files, so never build class names at runtime (`bg-${name}-500`). Use a full class name or an inline `var(--color-…)` style.
- **Fonts: Kareem chooses them.** Claude may recommend options when asked, but never picks one.
  - **Display (big titles): Oswald**, weights 200–700, as the free stand-in for Balboa, which Kareem wanted but which is paid (Adobe Fonts or a foundry license). Oswald was picked by rendering free candidates against real Balboa specimens. Use `letter-spacing: -0.02em` to `-0.025em` on headlines to match Balboa's tight spacing, except very large type (the hero's ~100–232px headline), which uses normal tracking to match the design.
    - Gotcha: an `em` letter-spacing is computed on the element that declares it, and children inherit the pixel value. Put `tracking-*` on the element that has the font size, not on a parent with a different size.
  - **Accent: Shadows Into Light** (handwritten, 400 only): postcard notes, doodled callouts, easter-egg labels, game scores. Not for body text, forms, buttons, or prices.
  - **Body: Figtree** (chosen over Nunito and DM Sans): paragraphs, forms, prices, buttons.
  - All three load through `next/font/google` in `src/app/layout.tsx` and map to Tailwind in `globals.css`. Use `font-sans` (Figtree, the default), `font-display` (Oswald; pair it with `tracking-tight`, which is -0.025em), and `font-hand` (Shadows Into Light).

## Conventions

- Server Components by default. Put `"use client"` on the smallest leaf that needs state, effects, or browser APIs.
- **Structure:** routes live in `src/app/`; shared components in `src/components/` (layout pieces in `src/components/layout/`), as named exports. Import with the `@/` alias.
- **Layout:**
  - The root layout renders `<SmoothScroll />` and `<PauseOffscreen />` (both draw nothing), the skip link, `<Navbar />`, the page's single `<main id="main">`, and `<Footer />`. Pages render `<section>`s and never their own `<main>`.
  - `<html>` has no fixed height (no `h-full`): Lenis watches `<html>` grow to know how far the page scrolls. The body's `min-h-svh` keeps the footer at the bottom of short pages.
  - Page content is centered with `mx-auto max-w-6xl px-6`.
  - The navbar is `fixed` and floats over the page. Pages clear it with top padding (`pt-28 md:pt-36`); only the homepage hero sits under it on purpose. `scroll-pt-*` on `<html>` keeps anchor jumps and keyboard focus from landing under it.
  - Pages set `export const metadata = { title: "…" }`, and the root template turns it into "… | Vantage".
- **Mobile-first:** unprefixed classes apply at every size; `sm:`/`lg:` add from 640px/1024px. Check every page at 320px and 390px, and just under 1024px: a ~1025px browser window with a scrollbar lays out at ~1010px, so it gets the tablet (`md`) layout, not `lg`.
  - `short:` is a custom **height** breakpoint (`globals.css`): phone widths under 52rem (832px) tall, e.g. iPhone SE 375×667 or 360×780 Androids. The hero uses it to tighten up so the beach fits on the first screen. Check heroes at 375×667 too.
  - **Line breaks:** a title that could leave one word alone on its last line gets `text-balance` (CSS `text-wrap: balance`: lines of even length, never more lines; Where we go, the Journey), or a `<br />` where the exact break matters (the boarding pass and the Playground: "Your seat is / waiting"). Paragraphs and quotes get `text-pretty` (only fixes a lonely last word).
  - **Container queries** for a component that sits in spots of different widths (a card in a 1-, 2- or 3-column grid): `@container` on its wrapper, then `@sm:` etc. inside, which check the wrapper's width instead of the screen's. The luggage tag (`featured-tours.tsx`) switches to the design's roomy desktop sizes at `@sm:` (the tag is at least 384px wide).
- **Testing in the browser:** Kareem usually has `npm run dev` running on port 3000, and Next allows one dev server per project. Test against it instead of starting another, and never kill it.
- **Screenshots:** headless Chrome's `--window-size` can't go narrower than ~500px and silently lies. For phone widths, use CDP `Emulation.setDeviceMetricsOverride` (verified: `innerWidth` reports 320) or a fixed-width `<iframe>` on a local host page. Screenshot `clip` coordinates are page coordinates, so add `scrollY` after scrolling.
- **Next.js changes fast.** Before using a Next.js API, read the version-matched docs in `node_modules/next/dist/docs/`, because training data may be outdated (e.g. `middleware.ts` is now `proxy.ts`, `params`/`searchParams` are Promises, and caching is explicit via `"use cache"`).
- Zustand is for client UI/experience state only: menus, modals, the booking wizard, the wishlist (`persist`), the sound toggle, easter-egg progress and mini-game scores, and state shared between the R3F canvas and the DOM. Server data (tours, the current user) stays in Server Components. A store holding per-user data goes through a context provider, never a module-level singleton, because that would be shared across requests on the server.
- **Popovers and menus** use the native `popover` attribute (`popoverTarget` on the button), so open/close, Esc, tap-outside, and the screen-reader "expanded" state come free.
  - Never put a display class (`flex`, `grid`, `block`) on the `[popover]` element itself: it overrides the browser's hidden-while-closed rule. Style an inner wrapper instead.
  - The layout (navbar) stays mounted across Next.js navigations, so a popover in it must close itself on link clicks (see `src/components/layout/menu-panel.tsx`).
- **Whole-card links:** a card that opens somewhere has one real link (e.g. "View tour", with the tour name added in `sr-only` text) plus `after:absolute after:inset-0`. Its invisible `::after` layer covers the card (which is `relative`), so a click anywhere hits the link and hovering anywhere lights it up. Don't wrap the whole card in `<a>`: screen readers would read every word as the link's name. The link itself must not get a `transform`, or the layer shrinks to the link's size.
- **Scene animation (CSS):** loops and entrances live in `globals.css` (section 5) as `--animate-*` theme variables.
  - Keyframes move the individual `translate`/`rotate`/`scale` properties, never `transform`, so a loop and a hover effect on different properties combine.
  - When two effects need the same property, nest elements: e.g. the wrapper takes the hover `scale` and the inner SVG takes the idle `translate`.
  - Always `motion-safe:animate-*`. SVG parts that spin or squash need `origin-center transform-fill`.
  - **Loops cost CPU for as long as they run.** `<PauseOffscreen>` (`src/components/pause-offscreen.tsx`) marks every page `<section>` and the footer `data-offscreen` while it's off screen, and one plain rule in `globals.css` (outside any `@layer`, so it beats the `animate-*` classes) pauses every animation inside. Paused animations carry on from where they stopped, so entrances scrolled past mid-play finish when you come back. Its observer is inset by 1px (`rootMargin: "-1px 0px"`), because a section that only touches the screen's edge counts as intersecting.
  - **Gotcha:** a loop that moves a group *inside* an SVG drawing (`<g>`, `<path>`: the sun's rays, the ball's `rock`, the palm's fronds) makes the browser redo the page layout every frame. A loop on a whole `<svg>` or an HTML element only restyles it. `contain: layout paint` didn't help (measured). For new art, put a moving part in its own `<svg>` or HTML wrapper when you can.
  - **3D turns** (the flip-board tiles in `by-the-numbers.tsx`): `perspective-*` on the parent, and turn with `rotate-[x_90deg]`, which sets the `rotate` property like our keyframes. Tailwind's own `rotate-x-*` sets `transform` instead, so the two would stack. The browser draws anything turned in 3D on its own layer, where text can land a pixel off from its neighbors: once a piece has done its turn, hide it (`invisible`) instead of leaving it turned.
  - An SVG drawing whose trick moves parts outside its box gets `overflow="visible"`. **Gotcha:** inside a grid or flex box, that stops it from shrinking below its natural size (it renders far too big), so the container gives it `min-h-0` (the Journey's picture panels use `*:min-h-0`).
  - **One-shot toy animations** (on click, tap, or hover) use `<Poke animation playOnHover?>` (`src/components/scene/poke.tsx`). It sets `data-playing` until the named keyframes end, and the CSS decides what plays (`data-playing:animate-hop` on the toy, or `group-data-playing:animate-bounce-once` on a child). The toy's markup stays in Server Components.
    - Don't use `hover:`/`active:` for one-shots. `:active` lasts only while the button is held, and setting the same animation again never restarts it.
    - With a `label`, the toy is a real `<button>` (the beach ball). Without one, it's decoration (the palm, suitcases): `aria-hidden`, mouse and touch only, not a Tab stop.
  - **Entrances that play once, on scroll into view:** wrap the thing in `<Reveal>` (`src/components/reveal.tsx`). It marks its box `data-reveal="waiting"`, then `"seen"` once the box's top is 25% up the screen, and the CSS decides the rest with the `waiting:` and `seen:` variants, e.g. `waiting:opacity-0 motion-safe:seen:animate-swing-in motion-reduce:seen:animate-fade-in`. Without JavaScript nothing gets marked, so nothing stays hidden.
    - Give each item its own `<Reveal>` when items should wait for themselves (stacked phone cards would otherwise play off-screen). Stagger with an inline `style={{ animationDelay }}`.
    - When an entrance moves its element far (the boarding pass slides in from a whole pass-height away), animate a child and keep the `<Reveal>` box itself still: the observer measures the box where it is, transforms included.
    - **An entrance whose last frame is the element's normal look uses `backwards`, not `both`.** `backwards` shows the first frame during the delay, which is what hides it until its turn. `both` also holds the finished animation forever, which keeps the element on its own layer, and its text turns lighter and softer (the luggage tags had this until 10b). Keep `forwards`/`both` only when the end must differ from the element's normal style.
    - Something that swings or slides near the screen's edge can make the page scroll sideways mid-animation: its section gets `overflow-x-clip` (it hides only the sideways overflow, so things that stick out above, like the tags' strings, still show).
  - **Effects that follow the mouse:** the script only writes a CSS variable, and a `motion-safe:` class turns it into motion, so reduced motion switches it off like everything else. E.g. `<TagHover>` (`src/components/home/tag-hover.tsx`) sets `--lean` from -1 to 1 on `pointermove` and the class is `motion-safe:rotate-[calc(var(--lean,0)*-2deg)]` with a short transition. Mouse only (`event.pointerType === "mouse"`): touch screens have no hover. Measure a box that doesn't move with the effect, or the numbers wobble.
  - **Reacting to a hover somewhere else:** `group-hover:` only works inside the hovered element, and `peer-hover:` only on its later siblings. When a part must react to an element that's neither (the boarding pass's stub tears while "Explore tours" is hovered), a custom variant asks their shared box with `:has()`: `tearing:` in `globals.css` is `[data-pass]:has([data-tear]:hover) *`, wrapped in `@media (hover: hover)` like Tailwind's own `hover:`. No JavaScript.
- **Hero composition:** props near the headline sit inside the title "stage", whose font size is the headline size, and are positioned in `em` (`left-1/2 ml-[0.82em] top-[-1.69em]`). They scale and move with the headline at every width.
  - The hero's content layer is `pointer-events-none` so empty sky passes the pointer to the stars behind it; interactive children opt back in with `pointer-events-auto`.
  - **Gotcha:** the headline's tight `leading-[0.84]` makes its text catch clicks about 0.3em above its own box, because Chrome hit-tests by the font's full height. Toys that sit just above the headline need a layer above it (the plane layer is `z-20` and `pointer-events-none`).
- **Reduced motion has two sources:** the device setting, and the site's "Reduce motion" switch (footer), which puts `data-motion="reduce"` on `<html>`. It works like the theme: saved to `localStorage` (`vantage-motion`) and restored by the `<head>` script before the first paint.
  - `globals.css` redefines Tailwind's `motion-safe:` and `motion-reduce:` variants to check both, so always use those variants and every animation obeys automatically.
  - In JavaScript, use `prefersReducedMotion()` from `src/lib/motion.ts`, never `matchMedia` alone. A component that must react when either source flips (e.g. turning Lenis off) uses `useReducedMotion()` (`src/lib/use-reduced-motion.ts`).
  - Plain-CSS animations need `:root:not([data-motion="reduce"])` (see the navbar shrink).
  - If the device already asks for reduced motion, the switch hides (`[@media(prefers-reduced-motion:reduce)]:hidden`), since there's nothing to switch.
- **Smooth scroll (Lenis):** `<SmoothScroll />` smooths the mouse wheel site-wide; touch, keyboard and scrollbar stay native. It switches itself off with reduced motion. GSAP's ticker drives it, so scrolling and GSAP animations share one frame loop.
  - A box that scrolls on its own with the wheel (an overflowing panel or list) needs `data-lenis-prevent`, or Lenis scrolls the page instead. Touch-only scrollers (the phone swipe track) are fine.
  - **The loop sleeps when nothing glides.** Lenis's step on GSAP's ticker is removed after 30 frames without a smooth scroll (`lenis.isScrolling !== "smooth"`), and a `wheel` listener puts it back. Waking resets `lenis.time` to 0, because Lenis times each step from the frame before and a huge gap after a nap would make the glide jump straight to its end. With no listener and nothing animating, GSAP's ticker naps too (its `autoSleep`). ScrollTrigger keeps its own empty `requestAnimationFrame` loop (`_rafBugFix`, on purpose, for steady repaints) and a 250ms sync timer; both are cheap. If code ever calls `lenis.scrollTo()`, it must wake the loop first.
- **Scroll animation (GSAP):** import `gsap`, `ScrollTrigger` and `useGSAP` from `src/lib/gsap.ts`, which registers the plugins once.
  - Set up in `useGSAP` (it undoes every tween and pin on unmount, before React removes the DOM, which pins need). Use `gsap.matchMedia()` for per-breakpoint setups. Pass `useReducedMotion()` in `dependencies` with `revertOnUpdate: true`, and skip the motion setup when it's true. See `journey-track.tsx`.
  - **The no-JS layout is the default.** JavaScript switches into the animated layout by marking the section (`data-pinned`), and CSS restyles it with the `pinned:` variant (`globals.css`). While "riding" (phones swiping, or the pinned ride; the `riding` state in `journey-track.tsx`), React labels each card `data-stop="passed" | "here" | "ahead"`, and only then shows the progress bar. The calm grid gets no labels, so it looks finished. CSS reads the labels with one-line variants that use the same words: `here:` (the card the plane is at), `ahead:` (not reached yet), and `reached:` (here or passed). Kareem asked for this one vocabulary after an earlier version used different words in React and CSS. One-shot animations that react to the ride use `reached:`, not `here:`: when a card goes from here to passed, the animation stays attached and finishes instead of being cut off.
  - A pinned section must fit the screen: it's `min-h-svh`, and its big parts shrink with height via `min(<design size>, <a>svh - <b>)`, which keeps the design's size at 900px tall and still fits 657px (1366×768 laptops). The pin starts at `"bottom bottom"`, so if it ever overflows, the top is what's cut.
  - Pinning needs no `transform` (or `filter`) on the pinned element's ancestors, since `position: fixed` breaks under one. Use `scrub: true`, not a number: Lenis already smooths the scroll.
  - **Drawing a line in** (the globe's dashed flights, `globe.tsx` + `globe-flights.tsx`): a dashed line can't draw itself in (its dash settings are busy making the dashes), so it's seen through a stencil, an SVG `<mask>` holding a solid copy of the line with `pathLength={1}`. Animate the stencil's `strokeDashoffset` from 1 to 0 (with `strokeDasharray: 1`). **Gotcha:** GSAP rounds pixel values to whole numbers while animating, so a 1 → 0 tween needs `autoRound: false`, or it jumps halfway instead of drawing.
- Motion and 3D: honor reduced motion (no Lenis smoothing or scroll-scrubbed motion; simple fades are fine). Load 3D client-only and lazily, pause it offscreen, and give low-power and mobile devices a static fallback. Animation must never block content or hurt LCP/INP.
- Accessibility: semantic HTML first; everything keyboard-reachable with visible focus; alt text from tour data.
- Env: server-only `API_URL`. Use `NEXT_PUBLIC_` only for values that are safe to expose (e.g. the Cloudinary cloud name). Never commit `.env*`.
- Code style matches the backend and is enforced by Prettier (`.prettierrc`): no semicolons, double quotes, trailing commas, 100-column lines. Run `npm run format` after writing code. `endOfLine` is `"auto"` because git's `core.autocrlf=true` on this Windows machine checks files out with CRLF.

## Commands

- `npm run dev`: dev server (Turbopack) at http://localhost:3000. The backend also defaults to 3000; Next picks the next free port if 3000 is taken.
- `npm run build`: production build (also type-checks). `npm run start` serves it.
- `npm run lint`: ESLint.
- `npm run format` fixes formatting; `npm run format:check` only reports. Prettier skips everything in `.gitignore` (including this file) plus `.prettierignore` (`package-lock.json`, `AGENTS.md`, `/design/`). The leading `/` matters: plain `design/` also skips `src/app/design/`.
- `npm audit` reports 5 "high" findings. They're one dev-only chain under `eslint-config-next` (braces/micromatch), and `npm audit --omit=dev` is clean. **Don't run `npm audit fix --force`**: it downgrades `eslint-config-next` to v14.
- `AGENTS.md` is managed by Next.js (`next dev` rewrites its block), and line 1 of this file imports it. Commit both.

## Roadmap

**Current phase: 0, Foundations.** Done: scaffold, Prettier, fonts, design tokens (+ `/design` style guide), app shell (navbar, footer, skip link, title template, homepage hero shell). Now rebuilding the homepage from `design/HANDOFF.md`:
1. scene tokens ✓
2. theme switching ✓
3. navbar ✓ (frosted pill, mobile version, CSS scroll-driven shrink; below 360px the theme icon hides to make room)
3b. mobile menu ✓ (native popover; `MenuPanel` closes it on link taps)
4. static hero (`src/components/home/hero.tsx`):
   - 4a. text, fluid headline, `ButtonLink` ✓
   - 4b. sky ✓ (`src/components/scene/sky.tsx`): the sun/moon button (third theme switch), halo, clouds, stars and "z z", all idle-animated and interactive (hover faces, puffs, spins)
   - 4c. ground and toys ✓ (`src/components/home/hero-ground.tsx`, `src/components/scene/beach.tsx`):
     - sea with rolling waves, sand and dunes;
     - a swaying palm, hopping suitcases, and a pokeable beach ball;
     - "Scroll to take off" (xl only);
     - short screens: the hero is 757px at 1366×657, with the beach and buttons above the fold;
     - short phones (`short:`): the whole hero fits 375×667 exactly.
   - 4d. the plane ✓ (`src/components/home/hero-plane.tsx`, `src/components/scene/plane.tsx`):
     - on load, it flies in towing the "Small groups · big summers" banner (desktop) along a dotted trail whose dots drift back;
     - it floats; hover makes the banner flutter fast;
     - poke it and it flaps its wing like a bird, rising a little with each flap (the banner hops along). Kareem picked this over a loop-the-loop, which felt like too much.
5. footer ✓ (`src/components/layout/footer.tsx`):
   - capped at 1440px with 80px sides on desktop, like the design (Kareem tried full width and preferred this);
   - fluid wordmark (its dot hops on hover) and the handwritten tagline;
   - Tours / Company / Settings columns, which become one flat grid on phones;
   - Company links (Kareem's choice): About → his portfolio, Contact → email, GitHub → this repo;
   - "Dark mode" is the third theme switch;
   - the hidden crab scuttles when poked. Later it reveals the easter-egg counter (phase 7); "Sound off" waits until the site has sounds.
5b. "Reduce motion" switch ✓ (footer Settings, `src/components/motion-toggle.tsx`, `src/lib/motion.ts`)
6. The Journey (`src/components/home/journey.tsx`, `journey-track.tsx`, `src/components/scene/journey-props.tsx`):
   - 6a. the section ✓:
     - phones swipe the cards (CSS scroll-snap), and an IntersectionObserver drives the "01 / 06" progress and the badges;
     - md+ shows a calm grid (2 columns, 3 at xl), which is also the reduced-motion layout;
     - six stops (Kareem's call, for a longer scroll ride): the design's four plus "Meet your guide" (flag) and "Bring home stories" (postcard). Stops 4–6 have draft copy and new art.
   - 6b. the sideways ride ✓:
     - Lenis smooth scroll site-wide (driven by GSAP's ticker, off with reduced motion);
     - desktop (≥1024 wide, ≥600 tall, motion allowed): the section pins and the row of 360px cards slides sideways (1160px at 1440 wide). The card the plane is at lifts, badges fill in, "0X / 06" follows (its segments fill from the left over 0.5s), like the design's frame. Tablets, short windows and reduced motion keep the grid;
     - ride speed: `PACE` in `journey-track.tsx` = px of scrolling per px the cards slide. Kareem set it to 2 (1:1 felt too fast once the plane flew), so the pin lasts ~2.6 screens at 1440×900, close to the design's ~3.
   - 6c. the plane and the props ✓:
     - the route and the plane ✓ (pinned only): a dotted route (generated by `route()` in `journey-track.tsx` from the pinned card sizes) runs behind the stamps. One GSAP timeline, scrubbed by the pin's ScrollTrigger, slides the row and makes the plane hop stop to stop with MotionPath. Each hop is `sine.inOut` and fills its whole stretch: the plane slows to land and speeds up to take off, never stopping dead (an earlier wait-then-fly version felt jumpy). It parks on each card's top edge right of its stamp, and the next card lights up once the plane passes the top of its hop. The route and plane scale with the gap above the cards (112px plane at 900px tall, 66px at 657), so they never touch the title;
     - the props' tricks ✓ (`journey-props.tsx`, keyframes in `globals.css` section 5): when the plane reaches a card (`reached:`), its prop plays a one-shot after a 0.3s beat, and finishes even if you scroll on fast (Kareem's call; scrolling back onto a passed card doesn't replay it): the map's pin drops and wobbles, the ticket and the postcard get stamped, the suitcase hops (it has no lid to snap, so a squashy hop instead), the plane climbs in from the runway, the guide's flag runs up its pole. On cards ahead (`ahead:`) the result isn't there yet (no pin, stamp, plane or postmark; the flag sits low), and passed cards keep it. Works on phones too. The calm grid shows every result, still. No card is current until the cards come on screen (an IntersectionObserver, `started` in `journey-track.tsx`), so card 1's trick plays in view instead of during page load (Kareem caught that).
7. Featured tours (`src/components/home/featured-tours.tsx`, `src/components/scene/tour-scenes.tsx`, data in `src/lib/tours.ts`):
   - 7a. the section ✓:
     - three luggage tags, each with an eyelet, the string it hangs from (md+), a picture with a difficulty stamp, place, name, summary, chips (days, difficulty, rating; "New" with no reviews), a tear-off line, the price and "View tour". The whole tag is the link (to `/tours/[slug]`, which arrives in phase 2);
     - the tours are typed in (Kareem's call: no API until phase 2), shaped like the API's tour (`Tour` in `src/lib/tours.ts`), so phase 2 only changes that file. The pictures are SVG placeholders until real photos (backend item 1);
     - the homepage always shows three tours, and Reviews three reviews (Kareem's call). Phase 2 asks the API for just three (e.g. `?limit=3`), so each one has its own pose (`POSES[i]`, no wrapping around);
     - layout: phones stack (448px max), md shows two with the third centered below (a 4-column grid, two columns per tag), xl hangs three in a row (400px each at 1440). On phones the title shrinks with the screen so "This summer's" fits on one line down to 320px;
     - changes from the design: the tags hang lower, so their strings don't cross the title; phones also get the handwritten note and "See all tours" (the design dropped both), plus the stamps and pin icons; the note says "where to first?" (Kareem's pick; the design's "all 3 under 10 travelers" wasn't true for the seed data, whose group sizes are 15, 25 and 8).
   - 7b. the swing-in ✓: each tag waits, hidden, until it scrolls into view (`<Reveal>`), then drops in and swings around the top of its string (`origin-[50%_-67px]`), each swing smaller, until it hangs still (`swing-in`, 2s, in `globals.css`). Tags start 0.15s apart; on phones each one waits for its own turn. The swing is on a wrapper around the tag, so the tag's own small tilt stays. Reduced motion: a fade. (Fixed in 10b: `swing-in` and `fade-in` used `both`, which kept the tags' text drawn lighter after the swing; now `backwards`, see Conventions.)
   - 7c. hover ✓ (`src/components/home/tag-hover.tsx`): the tag leans toward the mouse, up to 2° (Kareem's tuning; the design said 4°), turning around the top of its string like a hanging tag (a 2D lean, not a 3D card tilt), and its stamp thunks once each time the mouse comes in (`thunk` in `globals.css`; it always finishes, like `<Poke>`). Mouse only; reduced motion turns both off. Three wrappers, one rotate each: `<Reveal>` (swing-in), `<TagHover>` (lean), then the tag's own tilt.
8. Where we go (`src/components/home/where-we-go.tsx`, `src/components/scene/globe.tsx`):
   - 8a. the section ✓:
     - night in both themes: `data-theme="dark"` on the section makes the tokens inside use their dark values (text, `bg-card` rows, the focus ring);
     - the title "Many starting points. One long summer." (Kareem's pick: no number, because the design's "Three" stops being true with the real API, where 9 tours start in 8 places), an intro line, and a list of where the featured tours start (`FEATURED_TOURS`, now with `startLocation.coordinates` from the seed data; Utah is the seed's 37.3°N, not the design's 38.6°N). The coordinates only show when the list is at least 512px wide (`@lg:` container query), so rows never wrap;
     - the globe, drawn flat from the design (pins and flights come from a small `PINS` list, ready for 8b);
     - phones: title, globe, list (the list moves down with `order-1`; the HTML keeps title then list for screen readers). Desktop: title and list on the left, globe on the right. On phones the title shrinks with the screen so it stays 3 lines down to 320px, and `text-balance` evens out its lines at every width, so "summer." never sits alone;
     - stars twinkle on desktop only: on narrower screens they'd land on the text (the design's phone version has none). The design's "give it a spin ↺" waits for a globe that spins (8d).
   - 8b. the flights ✓ (`src/components/home/globe-flights.tsx`): when the globe scrolls into view, the tiny plane flies from the white pin to Miami, then Banff, then Utah, and each dashed flight draws in behind it (one GSAP timeline: MotionPath for the plane, a mask per flight for the trail; started by ScrollTrigger, `once`). It grows in at takeoff and shrinks away onto the pin. Without JavaScript, or with reduced motion, the still picture stays: every flight drawn, the plane parked a third of the way along the Banff flight.
   - 8c. rows and pins ✓ (`src/components/home/pin-highlight.tsx`): each row is a link to its tour (404 until phase 2). Pointing at a row (mouse, finger, or keyboard focus), or at a pin, moves `data-on` to that row and its pin, which share a `data-slug`. The row gets the sun border and dot; the pin turns sun yellow, grows (`r` 11 → 14) and hops (the suitcases' `hop`, squashing at its base). The last one pointed at stays lit, like a globe turned to that pin; Miami starts lit in the server HTML. Reduced motion: it lights up without the hop.
   - 8d. the real 3D globe (later, with the other three.js scenes and the loader, per the handoff's build order): drag to spin with inertia, slow auto-rotate, and it turns to a hovered row's pin. The drawn globe stays as the reduced-motion and low-power fallback. Needs Kareem's OK to install React Three Fiber (proposed).

9. By the numbers (`src/components/home/by-the-numbers.tsx`):
   - 9a. the section ✓:
     - three numbers on flip-board tiles, one tile per digit (the line across the middle is the gap between the two flaps);
     - the numbers come from the API's tour stats (`getTourStats`, GET `/tours/stats`), typed in as `TOUR_STATS` in `src/lib/tours.ts` until phase 2 (Kareem's call: the API does the math, the frontend only shows it). They match the design (3, 4.9, 21). The places line ("Miami, Banff and Utah") comes from `FEATURED_TOURS`;
     - the rating's tiles are sun-colored (the design's phone version has one sun "4.9" tile; its desktop colored only the 9);
     - every tile size is in em of the row's font size, so one `text-*` class sizes them all: 140px digits at 1440, 80px on md, shrinking with the screen on phones (`min(5rem,17vw)`) so the words beside them keep room. Phones: tiles left, words right; md+: three columns;
     - screen readers get each number as text (`sr-only`); the tiles are hidden from them.
   - 9b. the flip ✓: like a real flip board, each tile holds a pile of cards from 0 up to its digit, each cut in half across the middle. When a row comes on screen (`<Reveal>`, each row on its own), its cards flip one at a time, 0.2s each (`FLIP`), each number 0.15s after the one before: a card's top half falls toward you and darkens, then the next card's bottom half drops into place (`flip-top`, `flip-bottom` in `globals.css`). Each tile stops on its own digit, so 4.9 takes about 2s (the 9 flips nine times) and 21 about 0.4s. All CSS on the server-rendered pile; the only JavaScript is `<Reveal>`. Without JavaScript, or with reduced motion, the pile starts out flipped (the final numbers). The finished tiles match 9a's pixel for pixel.

10. Reviews (`src/components/home/reviews.tsx`, data in `src/lib/reviews.ts`):
   - 10a. the section ✓:
     - "Postcards from travelers" (the design's title): three reviews as polaroids lying on a table, each with a strip of tape, then the quote and "Lourdes B. · The Sea Explorer · ★★★★★";
     - reviews have no photos, and don't need them: the polaroid's picture is the tour's. For now that's the luggage tags' drawings, shared through `TourScene` (`tour-scenes.tsx`). After backend item 1, use a real tour photo, e.g. one of `tour.images`, so it isn't the tag's photo again;
     - the handwritten caption is built from real data (Kareem's pick): the traveler's first name and where the tour starts, e.g. "lourdes in miami". The design's "miami, day 2. tacos!!" has no field in the API;
     - the reviews are typed in (`FEATURED_REVIEWS`, shaped like `GET /reviews`, which sends the whole tour with each review). They're real seed reviews (same `_id`, traveler and rating) with the design's quotes, because the seed's text is lorem ipsum. Reading reviews needs a login until backend item 2;
     - the polaroid is a physical object, so it looks the same in both themes: white, with a daytime picture (`data-theme="light"` on the picture). Screen readers skip it and get the quote, then "Lourdes B. · The Sea Explorer · 5 out of 5 stars";
     - layout like the tags: phones stack them, md shows two with the third centered below, xl three in a row (360px each, 70px apart, the middle one lower). On phones the title shrinks with the screen so it stays on 2 lines down to 320px.
   - 10b. the drop ✓: each polaroid waits, hidden, until it scrolls into view (`<Reveal>`, each one on its own), then drops onto the table like a photo seen from above: it starts bigger and a little turned, falls flat, speeding up, and bounces once (`drop-in`, 0.9s, in `globals.css`). Its quote and name fade in 0.5s later, as it lands. Polaroids start 0.15s apart. The section has `overflow-x-clip`, because a polaroid starts its drop bigger than its spot. Reduced motion: everything just fades. The finished section matches 10a pixel for pixel.
   - 10c. hover ✓: under the mouse, the polaroid straightens (its tilt eases to 0 over 0.3s) and its tape lifts off the photo: a little bigger, 4px higher, with a soft shadow. Plain CSS: `group` on the `<figure>`, so pointing anywhere on it (picture or words) does both. Tailwind v4's `hover:` only applies on devices that can hover, so phones skip it; reduced motion turns it off.
   - The section stops here (Kareem's call): the drop and the hover are enough, so no drag-to-shuffle, and phones keep the stacked polaroids instead of the design's swipeable stack.
11. Boarding pass, "Your seat is waiting" (`src/components/home/boarding-pass.tsx`). Built before the Playground (Kareem's call: the Playground is only games, so it comes last), but it stays last on the page, right above the footer:
   - 11a. the section ✓:
     - the homepage's last call to action, printed as a boarding pass: "Vantage · Boarding pass", "Flight VTG-026", the title, four fields (Passenger: You, From: Your couch, To: Somewhere sunny, Boarding: This summer) as a description list (`<dl>`), "Explore tours" and "Create an account" (`ButtonLink`, like the hero) and the note "don't lose this one". A dashed tear line, then the sun-yellow stub: Seat 1A, "Window, obviously" and a pretend barcode (repeating stripes);
     - phones and tablets: the pass stands up (576px max), with the stub at the bottom. lg+: it lies on its side, 1120px wide, tilted −1.5° like the design, with the stub on the right, a notch punched at each end of the tear line (a sky-colored circle, half hidden with `clip-path`), and two drifting clouds (`Cloud` from `sky.tsx`, lg only, like the design);
     - the section is `scene-sky` and the pass follows the theme; the stub is a physical object (sun yellow in both themes). The shadow (`shadow-xl`) sits on a wrapper with the pass's rounded shape;
     - the title is always two lines ("Your seat is / waiting"), shrinking with the screen on phones so the first line fits down to 320px;
     - changes from the design's phone version: phones keep all four fields, "Create an account" and the note.
   - 11b. the slot ✓: once the pass is on screen (`<Reveal>`), it comes out of a slot along its top edge, like a ticket from a printer (`slot-out`, 1.1s, in `globals.css`): it slides down from behind the slot line while `clip-path` hides the part still inside. The slide and the clip move together, so the clip's top edge stays on the line, and the clip's negative side and bottom insets leave room for the shadow. The easing overshoots a little, so it settles with a small bounce. A dark slit shows along the line only while it slides (`slot`). The Reveal box carries the size and the tilt and never moves; the pass inside it slides. Reduced motion: the pass is just there (the design says static). The finished pass matches a never-animated one pixel for pixel.
   - 11c. the tear ✓: while "Explore tours" is hovered, the stub starts to tear off: it turns 3° on a hinge at one end of the tear line (its bottom-left corner lying down, its top-right corner standing up), so a gap opens at the other end. "Create an account" doesn't tear it. Uses the `tearing:` variant (`globals.css`, see Conventions). Devices that can hover only; reduced motion turns it off.
   - 11d. easter egg (maybe with the others in phase 7): the Konami code turns the seat into "1A · COCKPIT" with confetti clouds; on phones, a 2s long-press on the sun/moon.
12. The Playground (`src/components/home/playground.tsx`; 07 in the handoff, built last but placed between Reviews and the boarding pass, like the design):
   - 12a. the section ✓:
     - "The playground", the title "Try to keep the ball up." (the design's, without "Bored?", Kareem's call), the description Kareem picked ("Bump the ball to keep it in the air. If it lands in the pool, you start over. Best score gets bragging rights."; the design's "a tiny beach-ball game hiding in a booking site" said too much), and "psst... 3 easter eggs hide on this page". The title always breaks after "keep", so "up." never ends up alone;
     - the pool: a rim (a card) with water inside, the hero's rolling waves (one 48px wave tile, `animate-waves`), the beach ball (`BeachBall`) bobbing in its ripple (one box for both, so the ripple hugs the ball at any pool shape), and a pool ring (`PoolRing`, new in `beach.tsx`). A scoreboard badge ("Score 00 · Best --", navy in both themes) sits on the rim's corner;
     - no game yet (Kareem's call): no "Play keep-it-up" / "Beach volleyball" buttons and no "tap to bump" note. Both games and their buttons come in phase 7, with 3D physics. Until then the pool is a picture, and screen readers skip it;
     - desktop: the section starts with a wave (the page background above, sand below); phones: a straight line. lg: words and note on the left, pool on the right (the pool spans both grid rows, so the note sits under the words on desktop and under the pool on phones). Tablets (md): the stack is centered (words, the pool capped at 576px, the note), so it doesn't hug the left edge with the right half empty (Kareem caught that at ~1010px). Dark mode: brown sand and dark water, like the design.

13. Homepage wrap-up ✓: every section at 320, 390, 768, 1010, 1280 and 1440, both themes; the accessibility tree; Tab through the whole page; Lighthouse on a production build.
   - Lighthouse: phone 94 / 100 / 96 / 100, desktop 100 / 100 / 96 / 100 (performance / accessibility / best practices / SEO). Phone LCP 3.0s (the hero's "SUMMER", on throttled 4G; the stylesheet and three small preloaded fonts), CLS 0. Best practices loses points only for console errors from link prefetches: in production, `<Link>` prefetches `/tours`, `/tours/[slug]`, `/signup` and `/login`, which 404 until phases 2 and 3 build them (dev mode doesn't prefetch, so they only show in production).
   - Accessibility: one `h1`, an `h2` per section, `h3`s for tags and stops; named landmarks and regions; every link and button named; no duplicate ids; nothing focusable inside `aria-hidden`; every decorative SVG hidden. Keyboard: a logical Tab order, a focus ring on every stop, nothing hidden under the navbar.
   - Fixed: the Journey's "01 / 06" wrapped onto two lines at 320 (now `whitespace-nowrap`, and `min-w-0` lets the segments shrink), and its title left "STOPS" alone on phones (now `text-balance`).
   - 13b. idle CPU ✓ (Kareem's go-ahead): with the page just sitting there, the main thread was busy ~30% at the hero and ~21–27% further down (2% with reduced motion). Two fixes: `<PauseOffscreen>` pauses loops in off-screen sections, and the smooth-scroll loop sleeps when nothing glides (see Conventions). Production build, 1440 wide, settled: hero ~30% → 25%, Reviews 21–27% → 15%, boarding pass 21% → 6%, Where we go 7%; per-frame page layouts at the boarding pass and Where we go dropped from ~120/s to 0. What's left is loops that are on screen, mostly ones that move groups inside SVG drawings (the hero has many). Moving those into their own `<svg>`s would be the next step, for the phase 8 performance pass. Headless CPU timings are noisy (±10%); counting style recalcs and layouts per second (`Performance.getMetrics`) gives steady numbers.
   - Running a production build next to the dev server is safe: `next dev` writes to `.next/dev` and `next build` to `.next` (Next 16). Serve it with `npx next start -p 3100` and stop it afterward.

Update this list as steps complete.

Creative work is woven into every phase: each page gets its own storytelling moment as it's built. Phase 7 is for the big standalone pieces.

0. **Foundations**: confirm the stack, scaffold, set up tooling, then design tokens, fonts, and the base layout.
1. **Backend prep** (Kareem, Claude mentors): checklist phase 1 items, Cloudinary migration, seed refresh, deploy the API to Render.
2. **Public pages**: home, tours list (filter, sort, paginate), tour detail (gallery, itinerary map, guides, reviews).
3. **Auth and account**: signup, login, logout, forgot/reset password, protected routes, settings, avatar upload, a one-click demo account.
4. **Reviews**: write, edit, and delete your own.
5. **Bookings**: Booking model, Stripe Checkout, and a webhook in the API; the booking flow and "My bookings" in the UI.
6. **Admin**: manage tours, users, reviews, and bookings.
7. **Playground and loading**: the beach ball and pool, mini-games with scores (the homepage Playground's keep-it-up and beach volleyball, whose buttons come with them; the handoff has the hero's ball roll down into the pool), the plane loading screen, the remaining easter eggs (incl. the boarding pass's Konami seat, 11d), and sound.
8. **Ship**: SEO (metadata, per-tour OG images, sitemap), an accessibility and performance pass, tests, README/case study.

## Open decisions

Items marked _proposed_ in the Stack table get confirmed with Kareem when we reach the step that needs them. Record new open questions here, then fold each answer into the sections above.

- **`getTourStats` before phase 2** (Kareem's backend code, backend checklist item 4b): it only counts tours rated ≥ 4.5 (the seed's 3.9 Sports Lover drops out of the count, the average and the review total), and `avgRating` averages the tours' averages instead of weighing each tour by its reviews. "By the numbers" wants every tour and the true average. Kareem fixes it; Claude only mentors.
