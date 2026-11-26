import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { PLANE_LENGTH, PlaneModel, useOutlineColor } from "@/components/three/plane-model"
import {
  fly,
  land,
  landFrom,
  MAP,
  setOff,
  type Flight,
  type Landing,
} from "@/components/room-route"

// The waiting room's 3D plane (phase 7 steps 7b and 7c), loaded by waiting-room.tsx when the
// room opens. A see-through canvas over the map, the same size, with the camera looking straight
// down. The plane flies the rest of the dotted route, then circles your pin (room-route.ts
// says how it steers), with its shadow on the sea. When the answer arrives, it lands at your
// pin: it comes down, so its shadow slides in under it, and stops.
// The camera is orthographic (no perspective), and it shows exactly the map's 600 × 300
// units, whatever size the map is drawn at. (0, 0) is the map's middle, with y going up.

// The sun: up and to the left, so the shadow falls down and to the right, like the drawn
// plane's
const SUN = new THREE.Vector3(-0.3, 0.55, 1)
const HEIGHT = 40 // how high it flies over the sea, in map units
// Its middle's height once it has landed: about the body's radius, so its belly sits on the
// sea. At 0, its low wings would dip under the shadow's sheet.
const AFLOAT = 8
const SIZE = 54 // its length on the map, like the drawn plane's, while it flies
const SMALLER = 0.1 // how much smaller it looks on the water, as if it went farther away

// onFlying: called once the first frame is drawn, so the drawn plane can go away
// landing: the answer has arrived, so it lands. onLanded: called once it's down.
type SceneProps = { onFlying: () => void; landing: boolean; onLanded: () => void }

export function RoomScene(props: SceneProps) {
  return (
    <Canvas
      orthographic
      flat
      shadows
      camera={{ position: [0, 0, 1000], near: 1, far: 3000 }}
      // Like the tours page's plane: twice the screen's pixels at least, which smooths the
      // toon shading's steps, and no big graphics chip for one small plane
      dpr={Math.min(3, Math.max(2, devicePixelRatio))}
      gl={{ powerPreference: "default", antialias: devicePixelRatio >= 2 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Soft sky light (up is toward us), plus the sun: about π in all, like on /design */}
      <hemisphereLight args={["#ffffff", "#cdeafe", 0.95]} position={[0, 0, 1]} />
      {/* Its shadows are drawn from the sun's point of view, in a square that covers the map */}
      <directionalLight
        castShadow
        intensity={2.2}
        position={SUN.clone().setLength(1000)}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-350}
        shadow-camera-right={350}
        shadow-camera-top={350}
        shadow-camera-bottom={-350}
        shadow-camera-near={1}
        shadow-camera-far={3000}
      />
      <Pilot {...props} />
    </Canvas>
  )
}

const Z = new THREE.Vector3(0, 0, 1)
const X = new THREE.Vector3(1, 0, 0)
// The model's top (+y) turned toward us, like a plane seen from above
const TOP_UP = new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2)
const lean = new THREE.Quaternion()

function Pilot({ onFlying, landing, onLanded }: SceneProps) {
  const plane = useRef<THREE.Group>(null)
  const sheet = useRef<THREE.Mesh>(null)
  const flight = useRef<Flight | null>(null) // null until the first frame
  const descent = useRef<Landing | null>(null) // planned when the landing starts
  const down = useRef(false) // it has landed (and said so)
  const outline = useOutlineColor() // lighter at night, so it shows on the dark sea

  // Before each frame: fly (or land) on a little, then put the plane and its shadow where it is
  useFrame(({ camera, size }, delta) => {
    const group = plane.current
    const shadow = sheet.current
    if (!group || !shadow) return

    // The map's 600 units fill the canvas's width (the map is drawn at any size)
    const zoom = size.width / MAP.width
    if (camera.zoom !== zoom) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }

    const first = flight.current === null
    flight.current ??= setOff()
    // A long gap between frames (the tab was hidden) isn't flying time
    const seconds = first ? 0 : Math.min(delta, 0.05)
    // How far it has come down: 0 in flight, 1 on the water
    let lowered = 0
    if (landing) {
      // The landing starts from wherever it is when the answer arrives
      descent.current ??= landFrom(flight.current)
      const step = land(descent.current, flight.current, seconds)
      lowered = step.down
      if (step.landed && !down.current) {
        down.current = true
        onLanded()
      }
    } else {
      fly(flight.current, seconds)
    }
    const { x, y, heading, roll } = flight.current
    const height = HEIGHT - (HEIGHT - AFLOAT) * lowered

    // From the map's units (x right, y down, (0, 0) at the top left) to the scene's
    group.position.set(x - MAP.width / 2, MAP.height / 2 - y, height)
    // Turned to its heading (the scene's y goes up, so the angle flips), its top toward us,
    // then leaning around its own nose-to-tail line (the model's right wing is +z)
    group.quaternion.setFromAxisAngle(Z, -heading).multiply(TOP_UP)
    group.quaternion.multiply(lean.setFromAxisAngle(X, roll))
    group.scale.setScalar((SIZE / PLANE_LENGTH) * (1 - SMALLER * lowered))

    // The shadow's sheet sits on the sea where the sun throws it, just big enough for it.
    // Its shader runs on every pixel it covers, so a small one costs less. The lower the plane,
    // the closer under it the shadow falls.
    const fall = height / SUN.z
    shadow.position.set(group.position.x - SUN.x * fall, group.position.y - SUN.y * fall, 0)
    shadow.scale.setScalar(SIZE * 1.6)

    if (first) onFlying()
  })

  return (
    <>
      {/* The sea, as far as the sun knows: an invisible sheet that only shows the shadows
          falling on it (1 × 1, scaled above) */}
      <mesh ref={sheet} receiveShadow>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.2} color="#002244" />
      </mesh>
      <group ref={plane}>
        <PlaneModel outline={outline} />
      </group>
    </>
  )
}
