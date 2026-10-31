import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react"
import * as THREE from "three"
import { PLANE_LENGTH, PlaneModel } from "@/components/three/plane-model"
import {
  growth,
  poseAt,
  progressNow,
  type Flight,
  type Place,
  type Pose,
} from "@/components/tours/flight"
import { blow, calm, type Wind } from "@/components/tours/wind"

// The 3D plane flying down the tours page (step 4c), loaded by tour-route.tsx in the browser
// only. The canvas is a see-through square that travels with the plane (fixed, under the
// navbar; clicks go through it), with the plane in its middle and its shadow on the page.
// It only draws a frame when something moves (frameloop "demand"), so a page nobody
// scrolls costs nothing.
// The camera is orthographic (no perspective), and 1 unit is 1px, with (0, 0) in the middle
// of the canvas and y going up. So the plane sits exactly over its spot on the page, and
// its height shows as size instead, plus a shadow that falls farther away.

// `place`: where the route is on the page, kept up to date by tour-route.tsx
// `trail`: the dotted line's <path>; the plane adds its dots as it passes them
// `wind`: what its air pushes around (wind.ts)
type SceneProps = {
  flight: Flight
  place: RefObject<Place>
  trail: RefObject<SVGPathElement | null>
  wind: RefObject<Wind>
}

// The sun: top right (like the header's) and high up, so shadows fall down and to the left
const SUN = new THREE.Vector3(2, 3, 10)
const SHADOW_SLANT = Math.hypot(SUN.x, SUN.y) / SUN.z // px a shadow falls per px of height
const GROUND = -30 // the page, a little below the plane when it sits on the cloud

const FOLLOW = 4 // how fast the plane catches up with the scroll: lower is lazier (per second)
const MAX_BEHIND = 35 // A fast scroll can't lose it off the screen
const ENTRANCE = 2 // seconds it takes to fly in from the right when the page loads

export function FlightScene({ flight, place, trail, wind }: SceneProps) {
  const frame = useRef<HTMLDivElement>(null)
  // Room for the plane at its highest, and its shadow at its farthest
  const size = Math.ceil(
    2 *
      (flight.planeLength * growth(flight.highest) * 0.55 +
        (flight.highest - GROUND) * SHADOW_SLANT),
  )

  return (
    <div
      ref={frame}
      aria-hidden
      style={{ width: size, height: size }}
      className="pointer-events-none fixed top-0 left-0 z-40"
    >
      <Canvas
        orthographic
        flat
        shadows
        frameloop="demand"
        camera={{ position: [0, 0, 1000], near: 1, far: 3000 }}
        style={{ pointerEvents: "none" }}
        // Twice the screen's pixels, at least: the browser shrinks them to fit, which
        // smooths every edge, even the sharp lines between the toon steps, which the
        // graphics chip's own smoothing (antialias) can't reach. A small canvas can afford
        // it. Screens with that many pixels already use antialias instead.
        dpr={Math.min(3, Math.max(2, devicePixelRatio))}
        // One small plane doesn't need a laptop's big graphics chip (R3F asks for it by
        // default), and a fixed canvas doesn't need re-measuring as the page scrolls
        gl={{ powerPreference: "default", antialias: devicePixelRatio >= 2 }}
        resize={{ scroll: false }}
      >
        {/* Soft sky light (up is toward us), plus the sun: about π in all, like on /design */}
        <hemisphereLight args={["#ffffff", "#cdeafe", 0.95]} position={[0, 0, 1]} />
        <Sun />
        <Pilot flight={flight} place={place} trail={trail} wind={wind} frameRef={frame} />
      </Canvas>
    </div>
  )
}

function Sun() {
  const light = useRef<THREE.DirectionalLight>(null)
  const width = useThree((state) => state.size.width)

  // Shadows are drawn from the sun's point of view, in a square that has to cover the
  // canvas. The smaller the square, the sharper the shadow's edge.
  useLayoutEffect(() => {
    const camera = light.current?.shadow.camera
    if (!camera) return
    const reach = width / 2 + 50
    camera.left = -reach
    camera.right = reach
    camera.top = reach
    camera.bottom = -reach
    camera.updateProjectionMatrix()
  }, [width])

  return (
    <directionalLight
      ref={light}
      castShadow
      intensity={2.2}
      position={SUN.clone().setLength(1500)}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={1}
      shadow-camera-far={4000}
    />
  )
}

const Z = new THREE.Vector3(0, 0, 1)
const X = new THREE.Vector3(1, 0, 0)
// The model's top (+y) turned toward us, like a plane seen from above
const TOP_UP = new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2)
const turn = new THREE.Quaternion()

// The cards' outline color (--outline: navy by day, a lighter navy at night), so the
// plane's outline doesn't vanish on the night sky (like the flat plane's). It's read again
// whenever the theme flips (data-theme on <html>).
function onThemeChange(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}
const outlineColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--outline").trim()

// Is the route on screen? From where it is on the page and the scroll
function onScreen({ top, height }: Place) {
  const y = top - scrollY
  return y + height > 0 && y < innerHeight
}

// frameRef: the canvas's box, which moves with the plane. The React Compiler only knows a prop
// is a ref (and so may be changed) when its name ends in Ref.
type PilotProps = SceneProps & { frameRef: RefObject<HTMLDivElement | null> }

function Pilot({ flight, place, trail, wind, frameRef }: PilotProps) {
  const plane = useRef<THREE.Group>(null)
  const sheet = useRef<THREE.Mesh>(null)
  const invalidate = useThree((state) => state.invalidate)
  const outline = useSyncExternalStore(onThemeChange, outlineColor, () => "#002244")
  const progress = useRef<number | null>(null) // the sample it's at; null: not placed yet
  const entrance = useRef<number | null>(null) // how far through it, 0 to 1; null: not decided
  const dotsShown = useRef(-1)

  // A new flight (something moved the stops): its samples mean something else
  useEffect(() => {
    progress.current = null
    dotsShown.current = -1
  }, [flight])

  // A new frame whenever the page scrolls (Lenis's smooth scroll scrolls it too) or
  // resizes, while the route is on screen, plus one as it leaves (to take the plane away).
  // And one for a new flight.
  useEffect(() => {
    let shown = false
    const redraw = () => {
      const showing = onScreen(place.current)
      if (showing || shown) invalidate()
      shown = showing
    }
    redraw()
    addEventListener("scroll", redraw, { passive: true })
    addEventListener("resize", redraw)
    return () => {
      removeEventListener("scroll", redraw)
      removeEventListener("resize", redraw)
    }
  }, [flight, place, invalidate])

  // No plane, no wind: leave nothing mid-sway (the motion switch flipped, the page hidden)
  useEffect(() => () => calm(wind.current), [wind])

  // Before each frame: move the plane. `invalidate` asks for another frame, so it keeps
  // moving by itself until it arrives.
  useFrame(({ size }, delta) => {
    const group = plane.current
    const shadow = sheet.current
    const box = frameRef.current
    if (!group || !shadow || !box) return

    const wanted = progressNow(flight, place.current) // where the scroll wants it
    const seconds = Math.min(delta, 0.05) // a long gap between frames isn't flying time
    progress.current ??= wanted
    // The first frame decides: flying in only if the page is still at the start
    entrance.current ??= wanted === 0 ? 0 : 1

    let pose: Pose
    if (entrance.current < 1) {
      entrance.current = Math.min(1, entrance.current + seconds / ENTRANCE)
      const eased = 1 - (1 - entrance.current) ** 3 // fast at first, slowing down to land
      pose = { ...poseAt(flight.entrance, eased * (flight.entrance.count - 1)), dots: 0 }
      invalidate()
    } else {
      // It closes part of the gap to where the scroll wants it, on its own clock, instead
      // of copying the scroll. The scroll ends in whole-pixel steps with growing gaps
      // between them, and copying those made the plane tick to a stop.
      const gap = wanted - progress.current
      progress.current += gap * (1 - Math.exp(-FOLLOW * seconds))
      progress.current = Math.max(progress.current, wanted - MAX_BEHIND)
      progress.current = Math.min(progress.current, wanted + MAX_BEHIND)
      if (Math.abs(wanted - progress.current) < 0.02) progress.current = wanted
      else invalidate()
      pose = poseAt(flight, progress.current)
    }

    // The trail: the dots behind the plane. The path only changes when a new one appears.
    if (pose.dots !== dotsShown.current) {
      dotsShown.current = pose.dots
      trail.current?.setAttribute("d", flight.dots.slice(0, pose.dots).join(""))
    }

    // Its wind, which gets farther the bigger it looks. Keeps asking for frames until
    // everything it pushed has wobbled to a stop.
    const reach = flight.planeLength * growth(pose.z) * 1.1 + 80
    const top = place.current.top - scrollY
    if (blow(wind.current, { x: pose.x, y: pose.y, reach, top }, seconds)) invalidate()

    // The canvas moves to where the plane is on screen, to whole device pixels (a fraction
    // would blur it), and the plane makes up the rest inside it. (0, 0) in the scene is
    // the canvas's middle, with y going up.
    const half = size.width / 2
    const x = place.current.left - scrollX + pose.x
    const y = place.current.top - scrollY + pose.y
    const boxX = Math.round((x - half) * devicePixelRatio) / devicePixelRatio
    const boxY = Math.round((y - half) * devicePixelRatio) / devicePixelRatio
    box.style.transform = `translate(${boxX}px, ${boxY}px)`
    group.position.set(x - half - boxX, boxY + half - y, pose.z)

    // Turned to its heading on the page, its top toward us, then pitched and rolled
    // around its own axes (the model's right wing is +z, its nose +x). Each multiply
    // turns it around its own, already turned axes.
    group.quaternion.setFromAxisAngle(Z, pose.heading).multiply(TOP_UP)
    group.quaternion.multiply(turn.setFromAxisAngle(Z, pose.pitch))
    group.quaternion.multiply(turn.setFromAxisAngle(X, pose.roll))
    // Its size on screen, bigger the higher it flies, as if it came closer
    group.scale.setScalar((flight.planeLength / PLANE_LENGTH) * growth(pose.z))

    // The sheet goes where the sun throws the shadow, big enough for it at any angle
    const fall = (pose.z - GROUND) / SUN.z
    shadow.position.set(group.position.x - SUN.x * fall, group.position.y - SUN.y * fall, GROUND)
    shadow.scale.setScalar(flight.planeLength * growth(pose.z) * 1.6)
  })

  return (
    <>
      {/* The page, as far as the sun knows: an invisible sheet that only shows the shadows
          falling on it. Small (1 × 1, scaled above), and it follows the shadow: its shader
          runs for every pixel it covers, so covering the whole canvas is what costs most */}
      <mesh ref={sheet} receiveShadow>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.16} color="#002244" />
      </mesh>
      <group ref={plane}>
        <PlaneModel outline={outline} />
      </group>
    </>
  )
}
