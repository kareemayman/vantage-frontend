import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { PLANE_LENGTH, PlaneModel, useOutlineColor } from "@/components/three/plane-model"
import { fly, MAP, setOff, type Flight } from "@/components/room-route"

// The waiting room's 3D plane (phase 7 step 7b), loaded by waiting-room.tsx when the room
// opens. A see-through canvas over the map, the same size, with the camera looking straight
// down. The plane flies the rest of the dotted route, then circles your pin (room-route.ts
// says how it steers), with its shadow on the sea.
// The camera is orthographic (no perspective), and it shows exactly the map's 600 × 300
// units, whatever size the map is drawn at. (0, 0) is the map's middle, with y going up.

// The sun: up and to the left, so the shadow falls down and to the right, like the drawn
// plane's
const SUN = new THREE.Vector3(-0.3, 0.55, 1)
const HEIGHT = 40 // how high it flies over the sea, in map units
const SIZE = 54 // its length on the map, like the drawn plane's

// onFlying: called once the first frame is drawn, so the drawn plane can go away
export function RoomScene({ onFlying }: { onFlying: () => void }) {
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
      <Pilot onFlying={onFlying} />
    </Canvas>
  )
}

const Z = new THREE.Vector3(0, 0, 1)
const X = new THREE.Vector3(1, 0, 0)
// The model's top (+y) turned toward us, like a plane seen from above
const TOP_UP = new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2)
const lean = new THREE.Quaternion()

function Pilot({ onFlying }: { onFlying: () => void }) {
  const plane = useRef<THREE.Group>(null)
  const sheet = useRef<THREE.Mesh>(null)
  const flight = useRef<Flight | null>(null) // null until the first frame
  const outline = useOutlineColor() // lighter at night, so it shows on the dark sea

  // Before each frame: fly on a little, then put the plane and its shadow where it is
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
    fly(flight.current, first ? 0 : Math.min(delta, 0.05))
    const { x, y, heading, roll } = flight.current

    // From the map's units (x right, y down, (0, 0) at the top left) to the scene's
    group.position.set(x - MAP.width / 2, MAP.height / 2 - y, HEIGHT)
    // Turned to its heading (the scene's y goes up, so the angle flips), its top toward us,
    // then leaning around its own nose-to-tail line (the model's right wing is +z)
    group.quaternion.setFromAxisAngle(Z, -heading).multiply(TOP_UP)
    group.quaternion.multiply(lean.setFromAxisAngle(X, roll))
    group.scale.setScalar(SIZE / PLANE_LENGTH)

    // The shadow's sheet sits on the sea where the sun throws it, just big enough for it.
    // Its shader runs on every pixel it covers, so a small one costs less.
    const fall = HEIGHT / SUN.z
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
