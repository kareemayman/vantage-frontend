import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type * as THREE from "three"
import { PlaneModel } from "@/components/three/plane-model"

// The 3D plane on the /design page, in two views. Loaded by plane-preview.tsx.
// <Canvas> sets up three.js (renderer, scene, camera, a frame loop) and draws its children.
// - flat: keep the palette's exact colors (no film-like tone mapping)
// - dpr: draw at the screen's pixel density, up to 2x
// - frameloop "demand": only draw when something changes, for still (reduced motion)

type ViewProps = { still: boolean }

type Vector = [number, number, number]

// A sun, plus soft sky light from every side so the shadows aren't black: white from
// above (`up`), pale sky blue (sky-100) from below. Together they add up to about π
// (0.95 + 2.2), which is what shows a fully lit spot in its exact palette color.
function Light({ sun, up }: { sun: Vector; up: Vector }) {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#cdeafe", 0.95]} position={up} />
      <directionalLight position={sun} intensity={2.2} />
    </>
  )
}

// Turning slowly on its own; drag to turn it yourself (OrbitControls). No zoom, so the
// mouse wheel still scrolls the page.
export function PlaneTurntable({ still }: ViewProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={still ? "demand" : "always"}
      camera={{ position: [3.6, 1.9, 4.6], fov: 32 }}
    >
      {/* Up and to the front right */}
      <Light sun={[4, 6, 5]} up={[0, 1, 0]} />
      <PlaneModel still={still} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!still}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  )
}

// Seen from above, the way it will fly down the tours page: weaving left and right and
// banking into each turn (it leans toward the side it turns to)
export function PlaneFromAbove({ still }: ViewProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={still ? "demand" : "always"}
      camera={{ position: [0, 0, 9], fov: 32 }}
    >
      {/* The page's sun: top right, toward us. "Up" (the sky) is toward us too */}
      <Light sun={[3, 4, 6]} up={[0, 0, 1]} />
      <Weaving still={still} />
    </Canvas>
  )
}

function Weaving({ still }: ViewProps) {
  const heading = useRef<THREE.Group>(null)
  const bank = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (still || !heading.current || !bank.current) return
    const time = clock.elapsedTime
    // Nose down the screen (-90°), swinging up to 30° each way. The bank follows how fast
    // it turns (the swing's slope, cos): flat at the ends of a swing, leaning most in
    // the middle of one. Minus: turning counterclockwise (seen from above) is a left
    // turn, and a left bank is a negative roll around the nose
    heading.current.rotation.z = -Math.PI / 2 + Math.sin(time) * 0.5
    bank.current.rotation.x = -Math.cos(time) * 0.6
  })

  return (
    // Three nested turns, outside in: the heading on the page, then a quarter turn so
    // the plane's top faces us (the camera), then the bank around its own nose-to-tail
    // axis
    <group ref={heading} rotation-z={-Math.PI / 2}>
      <group rotation-x={Math.PI / 2}>
        <group ref={bank}>
          <PlaneModel still={still} />
        </group>
      </group>
    </group>
  )
}
