# Vantage · Tours page (/tours): design handoff

**A plane where every window is a tour.** The top of the page is a cartoon plane
with a row of windows, and each window shows one tour's cover photo. That's the
overview, and the filters and sort live there. Scroll down and the camera zooms
into the first window until it fills most of the screen. The photo sits in the
frame and flips through four shots, with the tour's info beside it. Keep
scrolling: the camera pulls back, glides along the plane and zooms into the next
window. Scroll up to go back.

The window is the Hero B "Window Seat" frame: the same bezel, ring and pull-down
shade. The shades are the filters: a shade slides down on every window whose
tour doesn't match. It's CSS + GSAP (ScrollTrigger), with no 3D.

This bundle replaces the departures-board Tours handoff.

- Delete the old `pages/tours-*` and `screenshots/tours-*` files first: some
  of the old names aren't in this set.
- Then unzip it in the same place as the homepage handoff.

---

## Pick: version A (outside)

You asked for two overviews to choose from. Both are built and work the same
way (only the drawing changes):

- **A · outside:** the side of the plane flying in the sky. `pages/tours-desktop.html`
- **B · inside:** a row of cabin windows above the seats. `pages/tours-inside.html`, or
  the "B" button on the left edge of any page (mockup only).

**Go with A.**

- At a glance, the whole silhouette reads as "a plane", which is what makes
  the overview work.
- The night version is the strongest dark mode on the site: a moonlit plane
  with warm, glowing shades.
- It matches the homepage's cartoon plane.
- "The next plane flies in" makes physical sense.

B is cosy, but the bins and seats compete with the photos, and its phone
layout (a cabin turned on its side) is the weakest screen in the set. If you
pick A, delete the `.art--in` drawing, the `--cabin-*` tokens and
`drawSeats()` / `drawRecesses()`.

---

## What's in this folder

| Path | What it is |
|---|---|
| `TOURS-HANDOFF.md` | This file |
| `pages/tours-desktop.html` | **The page**, version A. Fully responsive (1440 → 1010 → 390). Light + dark, the scroll ride, filters, sort, photo flipping, see all windows |
| `pages/tours-mobile.html` | The same page in a 390px phone frame. Links switch state, version (A/B) and theme |
| `pages/tours-inside.html` | Version B (inside the cabin) |
| `pages/tours-zoom.html` | Opens zoomed into The Sea Explorer (rated tour) |
| `pages/tours-zoom-sale.html` | Opens zoomed into The Wine Taster (on sale: old price crossed out) |
| `pages/tours-filtered.html` | "Easy" is on: 4 windows open, 5 shades down |
| `pages/tours-empty.html` | No matches: every shade down, a note, "Clear filters" |
| `pages/tours-waiting.html` | The free server is waking up (`?t=58` starts the timer at 58s) |
| `pages/tours-error.html` | The API failed. "Try again" shows waiting, then loads |
| `pages/tours-reduced.html` | Reduced motion: windows in a grid with the info under each |
| `pages/tours-30.html` | 30 tours on 3 planes (21 made-up tours that borrow the 9 photos) |
| `pages/tours-parts.html` | Parts sheet: window anatomy, every window state, tags, info variants, ride controls, notes |
| `pages/tours.css` | All styles. Tokens at the top, then one numbered section per part |
| `pages/tours.js` | All behaviour. Data, geometry and timings at the top |
| `pages/vendor/` | GSAP 3.15 + ScrollTrigger + ScrollToPlugin, so the pages work offline. In the app, `npm i gsap` instead |
| `screenshots/tours-*.png` | Full-page screenshots of every state in both themes, plus the ride storyboard (list at the end) |

**Opening the pages:** double-click any of them.

- **Theme:** every page takes `?theme=dark`. The nav button, the sun/moon in
  the sky and the footer's "Dark mode" all switch it, and the choice is saved
  under the homepage's key (`vantage-theme`).
- **Version:** `?view=inside` shows version B.
- **Motion:** the footer's "Reduce motion" switches to the grid while the page
  is open.
- **Frozen states:** `?shot=1&at=win3` freezes the page on a window, with no
  pinning (that's how the screenshots were made). `at` takes a label
  (`overview`, `win0`…`win9`, `end`) or a time.

**Photos:** the pages load the real Cloudinary photos (`<slug>-cover`, `-1`,
`-2`, `-3`). My sandbox can't reach Cloudinary, so **the screenshots show drawn
stand-ins** (each tour's -1/-2/-3 is a crop or a different time of day of its
cover drawing). Open the pages to see the real photos.

**Mocked:**
- The tour data is at the top of `tours.js`.
- Departure dates are made up (summer 2027).
- The Northern Lights pretends to be new (no reviews), and The Wine Taster
  pretends to have $300 off.
- "View tour" and the list links show a toast with the URL they would open.

## Suggested prompt for Claude Code

> Read `TOURS-HANDOFF.md`, look at the `screenshots/tours-*` images (start with
> `tours-ride-storyboard-light.png`), and use `pages/tours.css` and
> `pages/tours.js` for exact values and behaviour. Build /tours in this repo's
> stack as version A, matching `pages/tours-desktop.html` at 1440, 1010 and 390
> in light and dark. Fetch tours from the API; keep filters and sort in the URL.
>
> - **Motion:** use GSAP + ScrollTrigger for the pinned ride, the shades, the
>   photo slides and the plane flights, with the exact timings in the Motion
>   section.
> - **Reduced motion:** swap the ride for the grid.
> - **Tokens:** add the new tokens to `globals.css`.
>
> Build in this order: the window component (one component, sized in em), then
> the overview, the ride, filters/sort, the states, and finally planes.

---

## Copy

Plain, everyday words, no puns. Handwritten notes are always lowercase (the
`.hand` class sets `text-transform: lowercase`).

**Page title (h1, Oswald, uppercase, last word on the sun sticker).** I'm using
the first one.
1. **Pick a `window`** ← in the mockup
2. Every window is a `tour`
3. Where to this `summer?`

**Handwritten note (next to the intro, with an arrow pointing down at the plane).** I'm using the first one.
1. **scroll, we'll stop at every window** ← in the mockup
2. every window is a different trip
3. closed shades mean no match

**Everything else:**

| Where | Text |
|---|---|
| Eyebrow | All tours · Summer 2027 |
| Intro | Every window is a small-group tour. Scroll to look out of each one, or tap the window you like. |
| Intro (reduced motion) | Every window is a small-group tour. Flip through the photos in each one, then pick the trip you like. |
| Filter groups | How hard: Easy · Medium · Difficult — How long: Up to 5 days · 6–9 days · 10+ days — Price per person: Under $500 · $500–$1,500 · Over $1,500 |
| Count | 9 tours · 4 of 9 tours match · No tours match — plus "Clear filters" |
| Sort | Sort by: Price: low to high (default) · Price: high to low · Rating: best first · Length: shortest first |
| Planes | Plane 2 of 3 · Next plane · (icon) Previous plane |
| Ride controls | See all windows (phone: All windows) · Window 2 of 9 · Previous window / Next window |
| Info | Name · Starts in · summary · "7 days" · "Medium" · "Up to 15 people" · ★ 4.8 (6 reviews) / NEW No reviews yet · $497 per person / $300 off $1,697 ~~$1,997~~ · Next trip Sun, Jun 6, 2027 · View tour |
| End of the ride | That's every window on this plane. [Next plane] [See all windows] (one plane: "That's every window.") |
| No matches | *every shade is down* · No tours match all of those · Try taking one filter off, or start over. · [Clear filters] |
| Waiting | Getting the windows ready · Our server naps when it's quiet. Waking it up can take up to a minute, then the shades go up. · 0:24 · *no need to refresh* · after 60s: Still waking up. Thanks for hanging on. [Try again] |
| Error | We can't load the tours right now · Something went wrong on our side, or the connection dropped. Give it a moment, then try again. · [Try again] |
| List | All tours as a list · The same tours as the plane, with the same filters and order. |

---

## Layout

### Breakpoints (by stage width)

| Width | Plane | Zoomed view |
|---|---|---|
| ≥ 1100 | Sideways, nose left, 10 windows in a row | Window left (up to 680px tall) + info card right (30vw, 360–460px), gap 56 |
| 700–1099 | Sideways (check 1010: filters wrap to two rows) | Same, info card 36vw (300–380px), gap 32 |
| < 700 | **Points up**: windows stack in a column, each with its name + price beside it | Wide window on top (full width − 32px), info card under it |

The nav is `position: fixed` on this page (same look as the homepage) so the
stage can use the whole screen. Below 980px it's the compact homepage nav.

### The stage (pinned while you ride)

One full-screen `.stage` (`100svh`), pinned by ScrollTrigger. Layers, back to front:

1. **Sky:** gradient, stars + moon at night, 4 clouds with parallax.
   Version B: the cabin ceiling colour instead.
2. **Camera → flyer → plane:** the drawing and the 10 window buttons.
   - The camera does the ride (x, y, scale, origin 0 0).
   - The flyer does the page-load glide, the idle bob and next-plane flights,
     so they never fight the ride.
3. **Veil:** sky colour at 66%. Dims the plane while you read.
4. **Zoomed window** (one element, refilled per tour) and the **info card**.
5. **Overview UI:** a CSS grid with rows nav space / intro / filters / plane
   box / bottom bar.
   - The empty `.ov__plane` row is measured, and the plane is scaled to fit it.
   - On phones the bottom bar splits: count + sort sit above the plane, and
     the plane counter sits below it.
6. **HUD:** See all windows · window rail · "Window 2 of 9" with prev/next.
   Plus the end card and the notes.

Under the stage: **All tours as a list** (the real links), then the footer.

### Plane geometry (plane units = px at scale 1)

- The drawing is **1520 × 520**, nose on the left.
- **Window n** (0-based) is centred at **x = 276 + 112n, y = 236** and is
  **100 × 128**: Hero B's 0.78 shape.
- **Phones:** the same drawing is turned 90° (nose up): the window column sits
  at x = 284 and windows are 128 × 100. Window 1 is always next to the nose,
  so the ride glides from nose to tail and the plane's direction of travel
  matches the scroll.
- **Empty seats:** a plane shows as many windows as it has tours, up to 10
  (9 tours → 9 windows).

### The window component (one component, two sizes)

Everything is in `em`, with **1em = the window's short side ÷ 56**, so the same
markup draws a 90px window on the plane and a 530px one zoomed in:

| Part | Value |
|---|---|
| Bezel | radius 23em, white (night: neutral-200), navy outline max(1.5px, .4em) |
| Ring | inset 1.6em, radius 21em, sand-100 with a .3em sand-300 edge |
| Glass | inset 4.2em, radius 18.6em, navy outline, overflow hidden, photo `object-fit: cover` |
| Shade | sand-100 + sand-300 ridges every 3.2em, navy bottom edge. **Open = yPercent −84** (a sliver with the handle shows), **closed = 0** |
| Handle | 7em × 1.6em, navy-600, navy outline |
| Glare | two white bars at 32%, rotated 28° |

See `tours-parts.html` for the numbered anatomy and every state.

### The camera

- **Overview:** the plane fitted into the plane box (`s0`).
- **Approach** (between windows): scale = s0 × **1.55**, or × 2.1 on phones.
- **Hold:** scale = s0 × **2.25**, or × 2.8 on phones.
- **Centring:** at approach and hold, the current window's centre sits on the
  zoomed window's centre, so the zoom never drifts.
- **Pop-out:** the crisp zoomed window grows out of the small one (scale
  ≈ 0.24 → 1), faster than the camera, so it "pops out" of the plane.
- **Code:** `camAt(i, scale)` in `tours.js` is three lines; copy it.

---

## States

| State | What you see |
|---|---|
| **Whole plane** (load) | All windows open, prices on tags under the windows (phone: name + price beside each). Hover or focus a window: it lifts 4px and a name bubble appears above it |
| **Zoomed in** | The window fills ~70% of the screen height; photo arrows + 4 dots inside the frame; info beside it (phone: under it). The rest of the plane is veiled behind. Two examples: Sea Explorer (rated), Wine Taster (on sale), plus Northern Lights on phone ("New") |
| **Filters on** | Shades down on windows that don't match, the matching photos slide forward, the tail windows stay shaded. Count: "4 of 9 tours match · Clear filters" (phone: a "Clear filters" chip leads the chip row) |
| **No matches** | Every shade down. The plane shrinks to the top half and a note card sits under it with "Clear filters". No ride. Clearing brings the shades up and focus goes to the first window |
| **Waiting** | The same shrunk plane with all shades down, doing a slow "peek" wave; a note with a timer. After 60s: "Still waking up" + Try again. When the data lands, the shades go up |
| **Error** | Shrunk plane, shades down, no wave, a plain note (role=alert) with Try again |
| **Reduced motion** | No plane ride: one window per tour in a grid (auto-fill, 300px min; one column on phones), info under each. Photos still flip, instantly. Filters show only matches |
| **30 tours** | Plane 1 of 3. "Next plane" (bottom bar, and the end card after the last window) flies the next one in |
| **End of the ride** | Back to the whole plane with the end card |

### Planes (growth)

- **10 windows per plane.** Results (filtered + sorted) fill planes in order;
  "plane k of n" counts only the planes the results need. 30 tours = 3 planes.
  Easy = 11 matches = 2 planes.
- **Filters and sort work across all planes.** If you're on plane 2+ when they
  change, the page flies you back to plane 1 with the new results.
- **The ride only visits the open windows of the plane you're on.** Each
  plane's ride is rebuilt when you change planes.
- **Clicking any window** zooms straight into it (no riding through the others).

### Filters + sort rules

- **Combining:** OR inside a group, AND across groups.
- **Price uses the price after any discount.** The $500–$1,500 band includes
  both edges.
- **Sort ties:**
  - price sorts → rating, then the soonest departure
  - rating sort → new (unrated) tours last, then more reviews first
- **Tags:** the tag under each window shows what you're sorting by:
  $ price / ★ rating ("New") / "9 days".
- **URL:** put filters and sort in it, e.g.
  `/tours?difficulty=easy,medium&length=short&sort=price-asc`.

---

## Motion (GSAP 3 + ScrollTrigger)

All values are in `tours.js`; the storyboard
(`screenshots/tours-ride-storyboard-*.png`) shows the ride frame by frame.

### Page load

- **The plane glides in** (on the flyer): from x +80% of the screen width,
  y −70px, rotate −4° (nose down) → 0 in **1.6s `power3.out`**. Phones: from
  y +90% of the screen height, 1.4s.
- **The shades go up**, starting 0.5s before the glide ends: **yPercent −84,
  0.55s `back.out(1.5)`, stagger 0.07** (left to right).
- **Tags** fade in (0.4s).
- **Idle bob** while you're on the whole plane: y 0 → 5px, rotate 0 → 0.35°,
  2.6s `sine.inOut`, yoyo, forever. It pauses during the ride.

### The ride: about one screen of scrolling per window

One timeline, `scrub: 0.5`, pinned on the stage. Its length is the timeline
duration × the stage height. Units below are screens (1 = 100vh).

| Beat | Length | What moves |
|---|---|---|
| Whole plane (start) | 0.2 | nothing: you can see every window |
| Glide to the window | 0.15 (first one: 0.25, from the whole plane) | camera → approach, `power1.inOut`. First time only: title, filters and sun fade up and out, tags fade, HUD fades in |
| **Zoom in** | 0.25 | camera → hold and zoomed window 0.24 → 1, both `power2.inOut`; zoomed window fades in over the first 20%; veil 0 → 1 from 20% to 80%; info card fades in and rises 26px in the last 40% (`power2.out`) |
| **Hold** (read, flip photos) | 0.4 | nothing. **Snap point** in the middle |
| **Pull back** | 0.2 | info card out first (rises 14px); veil out; zoomed window shrinks back into its slot and fades in the last 20%; camera → approach |
| …next window | | glide 0.15, zoom 0.25, hold 0.4, pull back 0.2 = **1 screen** |
| After the last window | 0.3 + 0.3 | camera back to the whole plane (`power1.inOut`), HUD out, end card in, tags back. Snap point in the end hold |

So **9 windows ≈ 9.9 screens** and a full plane of 10 ≈ 10.9. Clouds drift
the other way at 20–50% of the plane's speed (parallax).

**Snapping** helps you land on each window:
- `snapTo: 'labelsDirectional'`, with labels at `overview`, `win0…win9` and `end`.
- **`inertia: false`**, so a flick moves exactly one window.
- duration 0.25–0.8s, delay 0.08, `power2.inOut`.

**Gotcha:** don't put labels anywhere else, or snapping will stop there too.

### Jumps that skip the in-between

- **Click / Enter on a window** (from the whole plane):
  - Animate straight to that window's hold in **1s `power3.inOut`**. The
    camera zooms while the zoomed window grows out of the clicked one.
  - The veil comes in at 0.35s, the HUD at 0.45s, the info card at 0.65s.
  - Then set the scroll position to that window's snap point and finish the
    scrub tween (`st.getTween().progress(1)`), so nothing replays.
  - From inside the ride it's a quick cross-fade (0.15s out, jump, 0.25s in).
- **See all windows / Esc:** the reverse, 0.9s `power3.inOut`. The zoomed
  window shrinks back into its slot on the whole plane, then the page jumps to
  scroll 0. Focus returns to that window.
- **Previous / Next window:** a real scroll (ScrollToPlugin, 0.9s
  `power2.inOut`), so the scrub plays the actual ride.
- **Gotcha: the load event.** A jump made before the page's `load` event is
  undone by ScrollTrigger's load refresh. Wait for `load`, call
  `ScrollTrigger.refresh()`, then jump (see `ready()` → `zoom`).

### Filters: the shades (three beats)

1. **A · Shades down** on windows whose tour no longer matches: **yPercent
   −84 → 0, 0.42s `bounce.out`, stagger 0.05**.
2. **B · The matching photos slide** to their new windows. Each photo lifts out
   into a flight layer above the plane and travels to its new glass:
   - left/top/width/height over **0.75s `power2.inOut`**, stagger 0.03
   - a small hop (up 18px, scale 1.06, `sine.out`, yoyo)
   - windows they leave empty close their shades behind them
3. **C · New matches** (when you remove a filter): the photo goes in behind the
   closed shade, then the shade goes up: **0.55s `back.out(1.5)`, stagger
   0.06**.

Tags on the windows that change fade out at the start and back in at the end.
Then the ride is rebuilt for the new open windows. Changes made mid-animation
are queued, not dropped.

### Sort: photos slide to their new windows

Beat B only: every photo flies at once, and the tags switch to the new sort
value.

### Photos inside a window

- **Flip:** the photo strip slides by one photo: **xPercent −100 × n, 0.55s
  `power3.inOut`**.
- **Arrows** wrap around (after photo 4 comes the cover).
- **Dots** jump to any photo. A 40px swipe flips on touch.
- The strip resets to the cover when the window changes.

### Next plane

- **Fly off:** tags fade (0.2s). The current plane flies off forward: x −115%
  of the screen width, y −50, rotate −3°, **0.65s `power2.in`**.
- **Swap:** the new windows go in with their shades closed.
- **Fly in:** the next plane comes in from x +110%, y +40, rotate −2°, in
  **1.1s `power3.out`**. Its shades go up (stagger 0.06) as it lands, then
  the tags come back.
- **Phones:** the plane flies off the top and in from the bottom.

### Notes (empty / waiting / error)

- **The plane shrinks** to the top of its box (50% of the box height; phones
  40%): **0.7s `power3.inOut`**.
- **The note** fades up 16px under it (0.4s, delay 0.25).
- **Waiting wave:** each shade bobs up to yPercent −16 and back, 0.5s
  `sine.inOut`, yoyo, forever, with a 0.1s stagger, so a ripple runs along the
  plane.

### Reduced motion

- `prefers-reduced-motion: reduce` or the footer switch → the **grid**, with
  no pin, zoom, glide, bob or flights.
- Photos and filters change instantly.
- CSS transitions are also off.

### Performance notes

- Only `transform` and `opacity` animate. Tags fade through a CSS variable on
  the plane (`--tag-o`), so the scrubbed timeline can drive them.
- The camera has `will-change: transform`, so the zoomed-in plane behind the
  veil is a slightly soft bitmap (it reads as depth of field). The zoomed
  window and card are separate, crisp elements.
- **Photo sizes:**
  - The small windows load `w_1200`, as you specified.
  - If your Cloudinary account allows other sizes, use `w_400` for the
    overview and `w_1200` only in the zoomed window.
  - Load `-1/-2/-3` only for the window you're on (the mockup puts them in
    the zoomed view only).
- **Resize:** rebuild the ride on width changes, then jump back to the window
  you were on. **Gotcha:** a trigger made during a resize isn't measured yet,
  so call `ScrollTrigger.refresh()` before reading `start/end`.

---

## Tokens

The page tokens are the homepage's (`background`, `foreground`, `card`,
`muted`, `primary`, `cta`, `ring`, `outline`, `pop`, …), unchanged. New ones:

### Sky + plane (version A)

| Token | Light | Dark (night flight) |
|---|---|---|
| `--sky-top` / `--sky-mid` / `--sky-low` | sky-100 `#CDEAFE` / sky-50 `#E9F5FE` / sand-50 `#FFFCF0` | navy-950 `#002244` / `#002244` / neutral-950 `#07192C` |
| `--sky-ink` / `--sky-ink-soft` | navy-950 / navy-800 `#063E6F` | sand-50 / neutral-300 `#C5CFD9` |
| `--plane-body` | `#FFFFFF` | neutral-300 `#C5CFD9` (moonlit) |
| `--plane-belly` | sky-100 | navy-300 `#A3C4E8` |
| `--plane-line` | navy-950 | navy-950 |
| `--plane-stripe` / `--plane-stripe-2` | navy-600 `#1D5D9B` / sun-300 `#F4D160` | navy-600 / sun-400 `#D9AD55` |
| `--plane-nose` | sun-300 | sun-400 |
| `--plane-fin` | sky-300 `#75C2F6` | navy-500 `#4A7DB3` |
| `--plane-wing` | navy-600 | navy-700 `#114C83` |
| `--plane-cockpit` / `--plane-intake` | navy-950 / navy-800 | navy-950 / navy-950 |

The tail carries the sun-dot logo (sun-300 with a navy outline), in both themes.

### Windows (both versions)

| Token | Light | Dark |
|---|---|---|
| `--win-bezel` | `#FFFFFF` | neutral-200 `#DBE2EA` |
| `--win-line` | navy-950 | navy-950 |
| `--win-ring` / `--win-ring-edge` | sand-100 `#FDF5D3` / sand-300 `#E2D3A0` | sand-300 / sand-400 `#C3B089` |
| `--win-empty` (glass, no photo) | sky-100 | sky-950 `#102431` |
| `--shade` / `--shade-ridge` | sand-100 / sand-300 | **sun-200 `#FFE594` / sun-300**: cabin light through the shade |
| `--shade-handle` | navy-600 | navy-600 |
| `--shade-glow` | transparent | `rgb(244 209 96 / .55)`: glow round a closed shade |
| `--tag-bg` / `--tag-ink` | white / navy-950 | neutral-900 `#172A3E` / sand-50 |

### Cabin (version B only)

| Token | Light | Dark (night cabin) |
|---|---|---|
| `--cabin-wall` / `--cabin-ceiling` | sand-50 / sky-50 | neutral-900 / sky-950 |
| `--cabin-bin` / `--cabin-bin-lip` | white / sky-50 | neutral-800 `#2B3C4F` / neutral-900 |
| `--cabin-recess` / `--cabin-dado` | sand-100 / sand-300 | sky-950 / neutral-800 |
| `--cabin-seat` / `--cabin-seat-hi` | navy-600 / sky-300 | navy-800 / navy-500 |
| `--cabin-cover` / `--cabin-arm` / `--cabin-floor` | sand-50 / navy-300 / navy-300 | neutral-700 `#3F4F5F` / neutral-800 / neutral-950 |
| `--cabin-curtain` / `--cabin-curtain-2` | navy-600 / sun-300 | navy-700 / sun-400 |
| `--cabin-line` | navy-950 | navy-500 |
| `--cabin-light` / `--cabin-light-on` / `--cabin-glow` | sand-50 / sun-300 / none | neutral-800 / sun-200 / `rgb(255 229 148 / .16)` (reading-light cones) |

At night in version B, the window frames go dim: bezel neutral-700, outline
navy-500, ring neutral-800, shade sand-800 `#51453B`. The shades don't glow there.

### Stage UI

| Token | Light | Dark |
|---|---|---|
| `--veil` | `rgb(233 245 254 / .66)` | `rgb(0 34 68 / .66)` |
| `--panel` (count, sort and plane pills) | `rgb(255 255 255 / .9)` | `rgb(23 42 62 / .92)` |
| `--chip-bg` / `--chip-hover` | white / sky-50 | neutral-900 / navy-900 `#002F5A` |

---

## Data: what the zoomed view shows

Field names follow the usual Natours-style schema; map them to yours.

| Shows | From | Rule |
|---|---|---|
| Name · where it starts | `name`, `startLocation.description` | Name in Oswald; the start under it with a pin icon |
| One-line summary | `summary` | |
| Days · difficulty · group | `duration`, `difficulty`, `maxGroupSize` | "7 days" · ●●○ Medium · "Up to 15 people" |
| Rating | `ratingsAverage`, `ratingsQuantity` | ★ 4.8 (6 reviews); `ratingsQuantity === 0` → "New" pill + "No reviews yet" |
| Price per person | `price`, `priceDiscount` | The mockup treats `priceDiscount` as the **amount off** ($1,997 − $300 = $1,697, with "$300 off" and the old price crossed out). Check whether your API stores the amount off or the sale price |
| Next departure | `startDates` | The first date after today, "Sun, Jun 6, 2027" |
| Photos | Cloudinary | `https://res.cloudinary.com/azfjsm2k/image/upload/w_1200,f_auto,q_auto/<slug>-cover`, then `-1`, `-2`, `-3` |
| View tour | `slug` | `/tours/<slug>` |

The summaries for the three homepage tours are yours; the other six are placeholders.

---

## Accessibility

### Structure

- The stage is a `section` labelled by the page's `h1`.
- **The plane drawing, the shades, the glare and the clouds are decoration**
  (`aria-hidden`).
- **The real path for screen readers is the list under the plane** ("All
  tours as a list"): one link per tour with its name, start, days, difficulty
  and price. It follows the same filters and order.
- A **skip link** ("Skip to the tour list") is the first thing on the page.
- Each window is a `button` named like *"Window 2: The Sea Explorer, $497. Look
  closer."* Keyboard users need it to zoom in, so it can't be hidden. Closed or
  empty windows are `disabled` and `aria-hidden`, so Tab and the ride skip
  them.

### Keyboard

- **Order:** filters → count/clear → sort → the windows (left to right) → the list.
- **On a window:** Tab shows the name bubble, and **Enter zooms in and moves
  focus to the tour name** (`h2`, `tabindex=-1`). The next Tabs go: View tour →
  previous/next photo → the four dots.
- **Esc** or **See all windows** goes back to the whole plane, and focus
  returns to the window you came from. Space/Page Down ride forward (the snap
  keeps each window steady).

### Focus rings, everywhere

- **Windows:** a two-tone ring (sun-300 inside, navy outside), so it shows on
  the day sky, the white plane and the night sky.
- **Photo arrows and dots:** a sun-300 outline.
- **Chips, buttons and the sort select:** the homepage ring (navy-500 / sky-300).

### The ride can always be skipped

- See all windows (always in the HUD).
- Esc.
- The skip link.
- Clicking any window skips the in-between windows.
- Reduced motion removes the ride entirely.

### Announcements

A polite live region says:
- the count after filter changes (debounced 700ms), e.g. "4 of 9 tours match."
- plane changes
- loading

The error note is `role=alert`. The ride section is `aria-busy` while waiting.

### The photo viewer

- `role=group`, `aria-roledescription="photos"`, labelled "Photos of …".
- Hidden photos are `aria-hidden`; the shown one has alt text "The Sea
  Explorer, photo 2 of 4".
- Dots are buttons "Photo n of 4" with `aria-current`.

### Contrast (all AA, mostly AAA)

| Pair | Ratio |
|---|---|
| Title on the day sky (navy on sky-100) | 12.8 |
| Intro + legends (navy-800 on sky-100 / sky-50) | 8.7 / 9.8 |
| Hand note (navy-600 on sky-50) | 6.1 |
| Night sky text (sand-50 on navy-950) | 15.6 |
| Night intro (neutral-300 on navy-950) | 10.1 |
| Hand note at night (sky-300 on navy-950) | 8.2 |
| Tags (navy on white / sand-50 on neutral-900) | 16.0 / 14.2 |
| "New" pill, "$300 off" tag | 8.2 / 10.5 |
| Fact pills (day / night) | 8.7 / 8.7 |
| Focus ring (sun on navy / navy on white) | 10.8 / 16.0 |

Text on the sky or the sun is always navy, never white.

### Touch

- **Phone windows:** on the whole plane they're about 46 × 36px, and the label
  beside each window is part of the button, so each row is one big target.
- **Everything else:** at least 40px.

---

## Decisions I made

- **Shades come down, then the matches slide forward.** You asked for both
  "shades slide down on windows that don't match" and "matching tours fill as
  few planes as they need". So the shades drop first (you see what didn't
  match), then the matching photos slide to the front windows and the closed
  shades end up at the tail. The ride skips them because they're at the end.
- **Filters send you back to plane 1.** New results start from the first plane.
- **The empty 10th seat isn't drawn.** With 9 tours, plane 1 has 9 windows, so
  a closed shade always means "doesn't match".
- **Phones get labels.** At 390px the whole plane is small, so each window has
  its name and price beside it. The overview works like a list of photos.
- **One zoomed window.** It's refilled for each tour, so only four photos load
  at a time.
- **The sun and moon** in the sky still switch the theme (homepage easter egg).
  They fade out during the ride.

---

## Screenshots (full page, `screenshots/`)

All of them come in **-light** and **-dark**. The page is frozen with
`?shot=1`, so the zoomed shots show the stage at that window, then the list
and footer under it.

| File | State |
|---|---|
| `tours-desktop` | 1440, version A, whole plane |
| `tours-inside` | 1440, version B, whole plane |
| `tours-zoom` | Zoomed into The Sea Explorer |
| `tours-zoom-sale` | Zoomed into The Wine Taster (on sale) |
| `tours-inside-zoom` | Version B zoomed (The Snow Adventurer) |
| `tours-filtered` | Easy on: 4 open, 5 shades down |
| `tours-empty` | No matches |
| `tours-waiting` | Waiting (0:24) |
| `tours-error` | Error |
| `tours-reduced` | Reduced-motion grid |
| `tours-30` | 30 tours, plane 1 of 3 |
| `tours-ride-end` | End of the ride |
| `tours-mobile` | 390, whole plane (points up) |
| `tours-mobile-inside` | 390, version B |
| `tours-mobile-zoom` | 390, zoomed into The Sea Explorer |
| `tours-mobile-zoom-new` | 390, zoomed into The Northern Lights ("New") |
| `tours-mobile-filtered` | 390, filters on |
| `tours-mobile-empty` / `-waiting` / `-error` | 390 states |
| `tours-mobile-reduced` | 390, grid |
| `tours-mobile-30` | 390, 30 tours on 3 planes |
| `tours-1010` / `tours-1010-zoom` | 1010 whole plane + zoomed |
| `tours-parts` | Parts sheet |
| `tours-ride-storyboard` | The ride frame by frame, with scroll amounts |

**Tested** (Playwright, motion on), 105 checks:
- **Desktop:** load glide, the ride + snap, zoom in, photos, see all windows,
  Esc, keyboard + focus rings, filters (shades + slide), sort, no matches,
  theme, version B.
- **Planes:** 30 tours, plane switching, filters across planes.
- **Phone:** 390 column, labels, chip row, scroll + tap zoom.
- **1010, resize** (sideways ↔ upright), the reduced-motion grid (and toggling
  it live), waiting/error/retry, no sideways scroll, no JS errors.
