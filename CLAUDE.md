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
- **Keep explanations short.** Kareem loses focus with long text. Still teach every new concept with a tiny example, but use few words, short sections, and no excessive detail.
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
| Animation | Motion (`motion/react`) for UI, layout and page transitions; GSAP (ScrollTrigger, SplitText, MotionPath) for the scroll story and horizontal sections | proposed |
| Smooth scroll | Lenis (`lenis/react`), driven by GSAP's ticker once GSAP is in | decided |
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
| GET | `/tours/stats` | public | `data.stats` (aggregate over tours rated ≥ 4.5) |
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
- **Buttons:** `ButtonLink` (`src/components/button.tsx`) for links that look like buttons. Variants: `cta` (the sun sticker, which presses down on click) and `outline`. Sizes: `sm` (navbar) and `lg` (hero). There's no class-merging library, so `className` may only add layout (width, margins), never colors or sizes. A `<button>` version comes with the first form.
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
  - The root layout renders the skip link, `<Navbar />`, the page's single `<main id="main">`, and `<Footer />`. Pages render `<section>`s and never their own `<main>`.
  - Page content is centered with `mx-auto max-w-6xl px-6`.
  - The navbar is `fixed` and floats over the page. Pages clear it with top padding (`pt-28 md:pt-36`); only the homepage hero sits under it on purpose. `scroll-pt-*` on `<html>` keeps anchor jumps and keyboard focus from landing under it.
  - Pages set `export const metadata = { title: "…" }`, and the root template turns it into "… | Vantage".
- **Mobile-first:** unprefixed classes apply at every size; `sm:`/`lg:` add from 640px/1024px. Check every page at 320px and 390px.
- **Testing in the browser:** Kareem usually has `npm run dev` running on port 3000, and Next allows one dev server per project. Test against it instead of starting another, and never kill it.
- **Screenshots:** headless Chrome's `--window-size` can't go narrower than ~500px and silently lies. For phone widths, use CDP `Emulation.setDeviceMetricsOverride` (verified: `innerWidth` reports 320) or a fixed-width `<iframe>` on a local host page. Screenshot `clip` coordinates are page coordinates, so add `scrollY` after scrolling.
- **Next.js changes fast.** Before using a Next.js API, read the version-matched docs in `node_modules/next/dist/docs/`, because training data may be outdated (e.g. `middleware.ts` is now `proxy.ts`, `params`/`searchParams` are Promises, and caching is explicit via `"use cache"`).
- Zustand is for client UI/experience state only: menus, modals, the booking wizard, the wishlist (`persist`), the sound toggle, easter-egg progress and mini-game scores, and state shared between the R3F canvas and the DOM. Server data (tours, the current user) stays in Server Components. A store holding per-user data goes through a context provider, never a module-level singleton, because that would be shared across requests on the server.
- **Popovers and menus** use the native `popover` attribute (`popoverTarget` on the button), so open/close, Esc, tap-outside, and the screen-reader "expanded" state come free.
  - Never put a display class (`flex`, `grid`, `block`) on the `[popover]` element itself: it overrides the browser's hidden-while-closed rule. Style an inner wrapper instead.
  - The layout (navbar) stays mounted across Next.js navigations, so a popover in it must close itself on link clicks (see `src/components/layout/menu-panel.tsx`).
- **Scene animation (CSS):** loops and entrances live in `globals.css` (section 5) as `--animate-*` theme variables.
  - Keyframes move the individual `translate`/`rotate`/`scale` properties, never `transform`, so a loop and a hover effect on different properties combine.
  - When two effects need the same property, nest elements: e.g. the wrapper takes the hover `scale` and the inner SVG takes the idle `translate`.
  - Always `motion-safe:animate-*`. SVG parts that spin or squash need `origin-center transform-fill`.
- **Hero composition:** props near the headline sit inside the title "stage", whose font size is the headline size, and are positioned in `em` (`left-1/2 ml-[0.82em] top-[-1.69em]`). They scale and move with the headline at every width.
  - The hero's content layer is `pointer-events-none` so empty sky passes the pointer to the stars behind it; interactive children opt back in with `pointer-events-auto`.
- Motion and 3D: honor `prefers-reduced-motion` (no Lenis smoothing or scroll-scrubbed motion; simple fades are fine). Load 3D client-only and lazily, pause it offscreen, and give low-power and mobile devices a static fallback. Animation must never block content or hurt LCP/INP.
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
   - 4c. ground and toys: sea, sand, palm, suitcases, beach ball, plane + banner, "Scroll to take off". Also tune the hero height on short laptop screens (1366×657 is 843px tall today).
5. footer

Then the remaining sections in handoff order. Update this line as steps complete.

Creative work is woven into every phase: each page gets its own storytelling moment as it's built. Phase 7 is for the big standalone pieces.

0. **Foundations**: confirm the stack, scaffold, set up tooling, then design tokens, fonts, and the base layout.
1. **Backend prep** (Kareem, Claude mentors): checklist phase 1 items, Cloudinary migration, seed refresh, deploy the API to Render.
2. **Public pages**: home, tours list (filter, sort, paginate), tour detail (gallery, itinerary map, guides, reviews).
3. **Auth and account**: signup, login, logout, forgot/reset password, protected routes, settings, avatar upload, a one-click demo account.
4. **Reviews**: write, edit, and delete your own.
5. **Bookings**: Booking model, Stripe Checkout, and a webhook in the API; the booking flow and "My bookings" in the UI.
6. **Admin**: manage tours, users, reviews, and bookings.
7. **Playground and loading**: the beach ball and pool, mini-games with scores, the plane loading screen, the remaining easter eggs, and sound.
8. **Ship**: SEO (metadata, per-tour OG images, sitemap), an accessibility and performance pass, tests, README/case study.

## Open decisions

None right now. Items marked _proposed_ in the Stack table get confirmed with Kareem when we reach the step that needs them. Record new open questions here, then fold each answer into the sections above.
