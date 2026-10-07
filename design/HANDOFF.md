# Vantage homepage: design handoff

Everything from the design canvas, in one place for Claude Code: the homepage
(light and dark, desktop 1440 and mobile 390), every annotation note, the 3D
asset list, the loading screen and the theme tokens.

## What's in this folder

| Path | What it is |
|---|---|
| `HANDOFF.md` | This file: build spec, annotations, 3D assets, theme tokens |
| `pages/homepage-desktop.html` | Desktop homepage (1440), light + dark, working theme toggle |
| `pages/homepage-mobile.html` | Mobile homepage (390), light + dark, working theme toggle |
| `pages/hero-a-horizon.html` | Hero A, Horizon (the picked hero exploration) |
| `pages/hero-b-window-seat.html` | Hero B, Window Seat (not picked, kept for reference) |
| `pages/3d-asset-list.html` | 3D asset list board |
| `pages/loading-screen.html` | Loading screen |
| `screenshots/*.png` | Full-page screenshots of every page; homepages in both themes |

Every page is plain HTML + inline CSS and opens in any browser. The homepages
start in light mode; click the sun, the nav moon button or the footer link to
switch, or open them with `?theme=dark`. The theme tokens sit in a `<style>`
block at the top of each homepage under `[data-theme="light"]` /
`[data-theme="dark"]`, and every color in the markup is a `var(--token)`.

These are design comps, not production code: absolute positioning, inline
styles, SVG placeholders where the 3D goes. Treat them as the **source of truth
for exact values** (copy, sizes, spacing, radii, colors, rotations, placeholder
shapes) and the screenshots as the visual target, then rebuild with real
components.

## Suggested prompt for Claude Code

> Read `HANDOFF.md`, look at the screenshots in `screenshots/`, and use the
> HTML in `pages/` for exact values. Build the Vantage homepage in this repo's
> stack, matching `pages/homepage-desktop.html` (1440) and
> `pages/homepage-mobile.html` (390) section by section, in light and dark.
> Use the semantic tokens from `globals.css`, adding the extra scene tokens
> listed in HANDOFF.md. Build the 3D objects as static SVG placeholders first
> (copy the shapes from the pages), with a reduced-motion-safe structure, so
> three.js scenes can replace them later. Start with the nav, hero and theme
> switching.

## Build order

1. Tokens: add the scene tokens below to `globals.css`.
2. Static page, light + dark, desktop + mobile, with SVG placeholders.
3. Theme switching: sun click, nav button, footer link (spec below).
4. Scroll: smooth scroll, pinned horizontal Journey.
5. Loader, then the three.js scenes in asset-priority order (P1 → P3).
6. Mini-games and easter eggs.

---

## Sections and annotations

Section order: Hero → Journey → Featured tours → Where we go → By the numbers →
Reviews → Playground → Boarding pass → Footer.

### 01 Hero: Horizon
- Nav: sticky, frosted pill; shrinks 72→60px after 40px scroll. Moon/sun icon
  button is the accessible theme toggle (same action as clicking the sun).
- Load: the plane tows the "Small groups · big summers" banner in along the
  dotted path, settles into a gentle bob (±6px, 3s). Sun rises 40px with a squash.
- Scroll 0–100%: camera tilts up into the sky; the plane climbs out and becomes
  the Journey's guide. The ball stays on the sand until the Playground.
- Plane: hover = banner flutters, click = loop-the-loop.
- Sun: idle 40s ray rotation, blinks every ~6s; hover = squints and grins;
  **click = sunset → dark theme** (see Theme switching).
- Beach ball: grab, throw, bounce off the nav and sand (squash 0.8 on impact);
  wobbles when the cursor gets close; rolls downhill into the next section on scroll.
- Palm sways with cursor velocity. Clouds parallax at 0.2 / 0.4 / 0.6.
  Suitcase lid pops open on hover (squash-and-stretch), a sock falls out.
- Reduced motion: static scene; ball still clickable (bounces once); the note
  under the ball changes to "Toys are resting".

### 02 The Journey (pinned horizontal scroll)
- Pins for ~3 viewports; vertical scroll drives the track sideways.
- The hero's plane flies the dashed path and lands on each numbered stamp. The
  active card lifts 8px and its prop does its trick: pin drops on the map,
  ticket gets stamped, suitcase lid snaps shut, plane takes off.
- Progress: "02 / 04" + four segments.
- Reduced motion: no pinning, the 4 cards sit in a 2×2 grid.
- Mobile: no pinning, native horizontal swipe with scroll-snap, 1 card + peek.

### 03 Featured tours (luggage tags)
- Data:
  - The Sea Explorer: 7 days, Miami, USA, medium, $497, ★4.8 (6 reviews),
    "Exploring the jaw-dropping US east coast by foot and by boat"
  - The Forest Hiker: 5 days, Banff, Canada, easy, $397, ★5.0 (9 reviews),
    "Breathtaking hike through the Canadian Banff National Park"
  - The Star Gazer: 9 days, Utah, USA, medium, $2,997, ★4.8 (6 reviews),
    "The most remote and stunningly beautiful places for seeing the night sky"
- Enter: tags swing in on their strings, staggered, settle with a damped wobble.
- Hover: tag tilts toward the cursor (max 4°), the difficulty stamp thunks.
- Click anywhere on a tag → tour page. Reduced motion: fade only.

### 04 Where we go (3D globe)
- Drag to spin with inertia; slow auto-rotate.
- Arcs draw in one by one; a tiny plane rides each arc.
- Hover a list row → globe turns to that pin, pin bounces.
- Section stays navy (#002244) in both themes.
- Reduced motion: static globe image, pins still focusable.

### 05 By the numbers
- Split-flap counters flip up from 0 when 50% visible, once.
- Real data: 3 tours, 4.9 average (from 21 reviews), 21 reviewers.
  Swap in a live "happy travelers" total when there is one.
- Reduced motion: final values shown immediately.

### 06 Reviews (polaroids)
- Polaroids drop onto the "table" with a little bounce; drag to shuffle.
- Hover: tape lifts, polaroid straightens.
- Polaroid frames stay white in dark mode (physical objects, lit by the moon).
- The quotes and names are sample copy for the portfolio build.
- Mobile: swipeable polaroid stack with dots.

### 07 Playground
- The hero's beach ball rolls in and lands in the pool (same object across scroll).
- Keep-it-up: click/tap to bump, score ticks on the board; a miss = splash.
- Beach volleyball: a net appears, play against a cartoon crab.
- Keyboard: Space to bump. Reduced motion: game opens only on click, no idle bob.

### 08 Boarding pass CTA
- Copy: "Your seat is waiting"; Passenger: You; From: Your couch;
  To: Somewhere sunny; Boarding: This summer; Seat 1A, "Window, obviously".
- Scroll in: the pass slides out of a slot; on CTA hover the stub tears along
  the perforation.
- Easter egg: Konami code anywhere → seat changes to "1A · COCKPIT" plus confetti
  clouds (mobile: long-press the sun/moon for 2s instead).
- Reduced motion: static.

### 09 Footer
- Wordmark, handwritten "made with sunscreen & TypeScript", credits.
- Settings column: Dark mode / Light mode (third theme switch), Reduce motion, Sound off.
- Hidden doodle: the tiny crab bottom-right. Click → it scuttles across and
  reveals the easter-egg counter (x/3 found: sun, Konami, crab).
- Wordmark sun dot wiggles on hover.

### Mobile notes
- 3D scenes render at half resolution; toys stay interactive (tap the ball).
- Globe: drag to spin, list below it.
- Nav: wordmark, theme icon button, Sign up, menu button (all ≥44px targets).

---

## Theme switching (the sun easter egg)

Three ways to switch, all calling one `toggleTheme()`:
1. **Click the sun in the hero.** The sun sets behind the dunes with a squash
   (~0.8s), the sky shifts to night (~1.2s), stars fade in, and a sleepy moon
   rises in its place. Click the moon: sunrise, back to light.
   First sunrise only: the sun comes back wearing sunglasses ("too bright!").
   This counts as easter egg 1/3.
2. The moon/sun icon button in the nav (labelled "Switch to dark mode" /
   "Switch to light mode").
3. Footer › Settings › Dark mode / Light mode.

Rules:
- Light is the default; dark is opt-in (matches `globals.css`: `data-theme`, not
  the OS setting). Set `data-theme="dark"` on `<html>` and remember the choice in
  `localStorage` (wrapped in try/catch).
- The sun is a real `<button>` with an `aria-label` ("Set the sun: switch to dark
  mode" / "Wake the moon up: switch to light mode").
- Reduced motion: instant swap, no set/rise animation.
- Dark-only details in the comps: moon replaces the sun, stars in the hero sky,
  a "z z" doodle by the moon, hero note becomes "(night swim, anyone?)".

## Theme tokens

The comps use the semantic tokens from `globals.css` plus a few scene tokens it
doesn't have yet. Values are given as palette names from `globals.css`.

### Already in globals.css (used as-is)

| Token | Light | Dark |
|---|---|---|
| `--background` | sand-50 | neutral-950 |
| `--foreground` | navy-950 | sand-50 |
| `--card` | white | neutral-900 |
| `--muted` | sand-100 | neutral-900 |
| `--muted-foreground` | neutral-600 | neutral-300 |
| `--primary` / `--primary-foreground` | navy-600 / white | sky-300 / navy-950 |
| `--secondary` / `--secondary-foreground` | sky-100 / navy-800 | navy-800 / sky-100 |
| `--cta` / `--cta-foreground` | sun-300 / navy-950 | sun-300 / navy-950 |
| `--success` / `--success-soft` | lagoon-700 / lagoon-50 | lagoon-300 / lagoon-950 |
| `--elevation-pop` (sticker shadow) | 4px 4px 0 navy-950 | 4px 4px 0 sun-300 |
| `--elevation-lg` / `-xl` (cards) | navy-tinted | night-tinted |

### New scene tokens to add

```css
:root,
[data-theme="light"] {
  --outline: var(--color-navy-950);      /* cartoon outlines on UI (cards, pass, pool rim) */
  --tile: var(--color-white);            /* counter tiles */
  --sky: var(--color-sky-50);            /* hero sky, boarding-pass section */
  --sky-2: var(--color-sky-100);         /* journey section, sun halo */
  --sea: var(--color-sky-300);
  --sand: var(--color-sand-200);
  --dune: var(--color-sand-300);
  --cloud: var(--color-white);
  --cloud-shade: var(--color-sky-100);
  --chip: var(--color-sky-50);
  --chip-foreground: var(--color-navy-950);
  --chip-warm: var(--color-sand-100);    /* rating chip */
  --dash: var(--color-sand-300);         /* perforations, dashed dividers */
  --night: var(--color-navy-950);        /* globe section, both themes */
  --crab: var(--color-coral-600);
  --nav-bg: rgb(255 252 240 / 0.86);
  --nav-border: rgb(0 34 68 / 0.12);
  --ground-shadow: rgb(0 34 68 / 0.16);
}

[data-theme="dark"] {
  --outline: var(--color-navy-500);      /* navy-950 disappears on night backgrounds */
  --tile: var(--color-neutral-800);
  --sky: var(--color-sky-950);
  --sky-2: var(--color-sky-900);
  --sea: var(--color-sky-700);
  --sand: var(--color-sand-800);
  --dune: var(--color-sand-900);
  --cloud: var(--color-neutral-800);
  --cloud-shade: var(--color-neutral-900);
  --chip: var(--color-navy-800);
  --chip-foreground: var(--color-sky-100);
  --chip-warm: var(--color-sun-950);
  --dash: var(--color-neutral-700);
  --night: var(--color-navy-950);
  --crab: var(--color-coral-400);
  --nav-bg: rgb(7 25 44 / 0.82);
  --nav-border: rgb(117 194 246 / 0.18);
  --ground-shadow: rgb(0 6 16 / 0.5);
}
```

Why `--outline` instead of `--border`: `--border` (neutral-200 / neutral-800) is
right for quiet UI dividers, but the cartoon outlines need to stay bold. In dark
mode navy-500 still clears 3:1 against neutral-950 and neutral-900.

### What stays the same in both themes
- Illustration fills and their navy-950 outlines (plane, ball, palm, suitcases,
  tour-card scenes): raw palette colors, lit as-is.
- The sun CTA (sun-300 + navy-950 text + navy-950 border). In dark its sticker
  shadow turns sun-300, per `--elevation-pop`.
- Polaroid frames (white), difficulty stamps, boarding-pass stub (sun-300),
  scoreboard and globe section (navy-950).

---

## 3D asset list

Look: chunky low-poly, toon shading with a 3-step ramp, navy (#002244)
inverted-hull outline (~3px), flat palette colors, no textures.
Budget: one GLB per scene, Draco-compressed, under 2 MB total.
Every rig ships a still pose for reduced motion.
Priority: P1 needed for launch · P2 sections and games · P3 easter eggs and polish.

| # | Asset | Priority | Used in | How it moves |
|---|---|---|---|---|
| 01 | Cartoon plane | P1 | Loader · Hero · Journey · Globe (mini) | Body squash/stretch, wobbling tail fin, spinning nose cap. Bobs ±6px idle, banks into turns, loop-the-loop on click |
| 02 | Tow banner + rope | P1 | Hero | 6-bone cloth strip that ripples in the wind; flutters faster on hover |
| 03 | Smiling sun | P1 | Hero | Shape keys: blink, squint, grin. Rays rotate as one ring. Rises with a squash; sets behind the dunes for dark mode |
| 03b | Sleepy moon | P1 | Hero (dark) | Shape keys: sleepy blink, smile. Rises when the sun sets; stars fade in around it |
| 04 | Beach ball | P1 | Hero · Playground | Physics sphere (one shared instance). Grab, throw, bounce; 0.8 squash on impact; floats with buoyancy in the pool |
| 05 | Puffy clouds ×3 | P1 | Everywhere | Instanced, three silhouettes. Parallax 0.2 / 0.4 / 0.6; puff up 5% when the plane passes through |
| 06 | Sea + sand ground | P1 | Hero | Two toon planes; scrolling stripe shader for the waves. Dunes as one low-poly mesh. Night palette in dark mode |
| 07 | Palm tree | P2 | Hero | Bone-chain trunk, five leaf bones. Sways with cursor velocity; drops a coconut after 10 fast shakes |
| 08 | Suitcase ×2 | P2 | Hero · Journey 03 | Hinged lid: pops open on hover with squash, snaps shut on the Journey step. Sun and sky colour variants |
| 09 | Folded map + pin | P2 | Journey 01 | Map unfolds in 3 panels; pin drops from above and wobbles in |
| 10 | Ticket + stamp | P2 | Journey 02 | Ticket slides in, stamp slams down with a little camera shake and a green check decal |
| 11 | Globe + pins + arcs | P2 | Where we go | Drag to spin with inertia. Arcs are tube meshes drawn in by progress; pins bounce on hover |
| 12 | Pool + water | P2 | Playground | Rounded tile rim; toon water with ripple rings from the ball. Splash particles on a miss |
| 13 | Pool ring | P3 | Playground | Floats and drifts; the ball can land in it for a bonus point |
| 14 | Volleyball net | P3 | Mini-game | Two poles + cloth net that dents when the ball hits it |
| 15 | Cartoon crab | P3 | Volleyball · Footer egg | Volleyball opponent; scuttles across the footer when found. Claw snap + side-step cycle |
| 16 | Sunglasses | P3 | Sun easter egg | Appear on the first sunrise after dark mode; slide down the sun's nose once |
| 17 | Sock | P3 | Suitcase gag | Falls out of the suitcase lid on hover, flops on the sand |
| 18 | Sailboat | P3 | Tour card hover (optional) | Tiny boat that rocks on the Sea Explorer card. Can stay 2D if the budget is tight |

---

## Loading screen

See `pages/loading-screen.html` and `screenshots/loading-screen.png`.
- Sky-50 background, VANTAGE wordmark top centre, two clouds.
- A dotted arc from "Your couch" (white pin) to "Summer" (sun pin). The flown
  part of the arc is a solid primary line; the plane rides the arc as loading
  progresses.
- Big percentage (Oswald 72px, `role="progressbar"` with aria values) and a
  handwritten "fastening seatbelts...".
- "Skip the 3D" button bottom-right: loads the page with the static SVG
  placeholders instead of the three.js scenes.
- Follows the saved theme (night sky + moon pin in dark).
- Reduced motion: no plane animation; the progress line just fills.

## Accessibility checklist
- Content readable with every toy off; 3D is decoration, never the only path.
- Real `<button>` / `<a>` for every interactive element, ≥44px targets.
- `prefers-reduced-motion` respected everywhere (spec per section above), plus
  the footer "Reduce motion" switch.
- Never white text on sky or sun. Handwritten font only for short accents.
