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
- **Before every step, say what you're about to do and why** (a few sentences). Then do it. Then explain what changed.
- **Explain every new tool, API, or concept the first time it appears**: what it is, what problem it solves, how it works (with a minimal example), how it maps to something Kareem already knows (React SPA, Redux, Express; e.g. "`proxy.ts` is Next's version of Express middleware"), and the main alternative. Never introduce a library or pattern silently.
- **Keep it simple; don't overengineer.** Pick the simplest approach that works. Add abstractions, folders, or libraries only when a concrete need shows up, and say when something is optional. If a pattern is "industry best practice" but overkill for this project, say so and skip it.
- After writing code, walk through the non-obvious lines and link the official docs.
- One concept or feature per step; no large unexplained scaffolds. Pause after a new concept so Kareem can ask questions.
- At decision points, stop and ask, leading with a recommendation.
- If Kareem wants to write a part personally, give hints and review instead of handing over the solution.
- **Don't edit backend code.** Kareem writes all of `../backend` as practice; Claude only mentors there (see `../backend/CLAUDE.md`). The one exception is the checklist in `../backend/CLAUDE.md`, which Claude may update when asked. Never print secret values from `../backend/config.env`.
- Ask before adding dependencies, committing, or pushing. Commit style: `type(scope): description`, e.g. `feat(tour card): show next start date`.

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
| Tooling | npm; ESLint (scaffolded); Prettier + `prettier-plugin-tailwindcss` | ESLint decided, Prettier proposed |
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
| `sand` | `#FBEEAC` | warm surfaces and backgrounds |

Measured WCAG contrast: white on navy 6.8 ✓, navy on sand 5.8 ✓, navy on sun 4.6 ✓ (just passes AA), navy on sky 3.5 (large text only), white on sky 1.9 ✗, white on sun 1.5 ✗. **Text on sky or sun must be navy or darker, never white.**

For the design-tokens step:
- **Colors:** keep these four as the identity. Claude may derive extra colors wherever contrast or UI states need them:
  - lighter and darker steps of each hue;
  - a dark "ink" text color;
  - neutrals tinted toward navy or sand rather than plain gray;
  - semantic success/warning/error colors that fit the palette.
- **State and effect tokens:** hover, active/pressed, focus ring, disabled, borders and dividers, surface/elevation levels, overlays, and shadows (tinted navy, not black). Also radii and spacing where useful.
- All of these become Tailwind `@theme` tokens. Components never use hard-coded hex values.
- **Fonts: Kareem chooses them.** Claude may recommend options when asked, but never picks one.

## Conventions

- Server Components by default. Put `"use client"` on the smallest leaf that needs state, effects, or browser APIs.
- **Next.js changes fast.** Before using a Next.js API, read the version-matched docs in `node_modules/next/dist/docs/`, because training data may be outdated (e.g. `middleware.ts` is now `proxy.ts`, `params`/`searchParams` are Promises, and caching is explicit via `"use cache"`).
- Zustand is for client UI/experience state only: menus, modals, the booking wizard, the wishlist (`persist`), the sound toggle, easter-egg progress and mini-game scores, and state shared between the R3F canvas and the DOM. Server data (tours, the current user) stays in Server Components. A store holding per-user data goes through a context provider, never a module-level singleton, because that would be shared across requests on the server.
- Motion and 3D: honor `prefers-reduced-motion` (no Lenis smoothing or scroll-scrubbed motion; simple fades are fine). Load 3D client-only and lazily, pause it offscreen, and give low-power and mobile devices a static fallback. Animation must never block content or hurt LCP/INP.
- Accessibility: semantic HTML first; everything keyboard-reachable with visible focus; alt text from tour data.
- Env: server-only `API_URL`. Use `NEXT_PUBLIC_` only for values that are safe to expose (e.g. the Cloudinary cloud name). Never commit `.env*`.
- Code style matches the backend: no semicolons, double quotes, 2-space indent, trailing commas, ~100-column lines (Prettier, once it's added; the scaffold's files still use semicolons).

## Commands

- `npm run dev`: dev server (Turbopack) at http://localhost:3000. The backend also defaults to 3000; Next picks the next free port if 3000 is taken.
- `npm run build`: production build (also type-checks). `npm run start` serves it.
- `npm run lint`: ESLint.
- `npm audit` reports 5 "high" findings. They're one dev-only chain under `eslint-config-next` (braces/micromatch), and `npm audit --omit=dev` is clean. **Don't run `npm audit fix --force`**: it downgrades `eslint-config-next` to v14.
- `AGENTS.md` is managed by Next.js (`next dev` rewrites its block), and line 1 of this file imports it. Commit both.

## Roadmap

**Current phase: 0, Foundations.** Done: scaffold. Next: Prettier, then design tokens. Update this line as steps complete.

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
