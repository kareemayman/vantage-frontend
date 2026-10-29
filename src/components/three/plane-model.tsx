import { useFrame, type ThreeElements } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js"

// The cartoon plane in 3D (design/HANDOFF.md, 3D asset 01): the homepage's plane, built
// in code from simple shapes, so there's no model file to download. The handoff's look:
// chunky, toon shading (3 steps of light), a navy outline, flat palette colors.
// The nose points along +x and the top along +y (the plane seen from its left side); a
// scene turns it however it needs.
// three.js only runs in the browser: scenes load this through next/dynamic, ssr: false.

// Raw palette colors (globals.css): the plane looks the same in both themes
const NAVY_950 = "#002244"
const NAVY_600 = "#1d5d9b"
const SKY_300 = "#75c2f6"
const SUN_300 = "#f4d160"
const WHITE = "#ffffff"

// The navy outline's thickness, in the model's units (the body is 2.7 long), so it gets
// thicker as the plane comes closer, like the rest of it
const OUTLINE = 0.045

// Toon shading: each spot gets one of 3 levels of light (shadow, middle, lit) instead of
// a smooth fade. The material looks its level up in this 3-pixel strip; NearestFilter
// stops it from blending neighbors, so the steps stay sharp.
const STEPS = new THREE.DataTexture(new Uint8Array([105, 185, 255]), 3, 1, THREE.RedFormat)
STEPS.minFilter = THREE.NearestFilter
STEPS.magFilter = THREE.NearestFilter
STEPS.needsUpdate = true

// The outline, with the "inverted hull" trick: a copy of the shape, puffed out a little
// (every point pushed out along its normal, the direction the surface faces there), then
// painted on its inside only (BackSide, in Part). It sits behind the shape, so only the
// rim that sticks out around the edges shows.
function outline(geometry: THREE.BufferGeometry) {
  // Without normals and texture spots, the points two faces share (a hard edge, the
  // seam where a round shape closes) become one point with one direction between both
  // faces, so the puffed copy doesn't crack open along those edges
  const hull = mergeVertices(geometry.clone().deleteAttribute("normal").deleteAttribute("uv"))
  hull.computeVertexNormals()
  const position = hull.getAttribute("position")
  const normal = hull.getAttribute("normal")
  for (let i = 0; i < position.count; i++) {
    position.setXYZ(
      i,
      position.getX(i) + normal.getX(i) * OUTLINE,
      position.getY(i) + normal.getY(i) * OUTLINE,
      position.getZ(i) + normal.getZ(i) * OUTLINE,
    )
  }
  return hull
}

// One part of the plane: its shape, and its outline's
type Shape = { geometry: THREE.BufferGeometry; outline: THREE.BufferGeometry }
const shape = (geometry: THREE.BufferGeometry): Shape => ({ geometry, outline: outline(geometry) })

// The body: this outline as [radius, distance along the body], from the tail to the nose,
// spun around its axis like a vase on a pottery wheel (LatheGeometry). The lathe's axis
// is y, so it's turned a quarter to point along x.
const BODY = shape(
  new THREE.LatheGeometry(
    [
      [0, -1.56],
      [0.1, -1.5],
      [0.22, -1.3],
      [0.38, -0.9],
      [0.48, -0.4],
      [0.52, 0.2],
      [0.5, 0.7],
      [0.44, 1],
      [0.36, 1.15],
    ].map(([radius, y]) => new THREE.Vector2(radius, y)),
    24,
  ).rotateZ(-Math.PI / 2),
)

// How flat shapes get their thickness (ExtrudeGeometry): 0.06 deep, plus a rounded 0.03
// edge (bevel) on each side, so they look chunky instead of cut from paper. That spans
// -0.03 to 0.09, so each one is moved back 0.03 to center it.
const THICKNESS = {
  depth: 0.06,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.03,
  bevelSegments: 3,
  curveSegments: 12,
}
const thick = (outline: THREE.Shape) =>
  new THREE.ExtrudeGeometry(outline, THICKNESS).translate(0, 0, -0.03)

// A pair of wings seen from above, as one flat outline (x forward, y across, `span` out
// on each side), from where the front and back edges are at the root and at the tips.
// The tips are rounded. Laid down a quarter turn, so they lie flat.
function wings(span: number, [rootFront, rootBack]: number[], [tipFront, tipBack]: number[]) {
  const tipMiddle = (tipFront + tipBack) / 2
  const outline = new THREE.Shape()
  outline.moveTo(rootFront, 0)
  outline.lineTo(tipFront, span)
  outline.quadraticCurveTo(tipMiddle, span + 0.14, tipBack, span)
  outline.lineTo(rootBack, 0)
  outline.lineTo(tipBack, -span)
  outline.quadraticCurveTo(tipMiddle, -span - 0.14, tipFront, -span)
  outline.closePath()
  return shape(thick(outline).rotateX(-Math.PI / 2))
}
const MAIN_WINGS = wings(1.45, [0.42, -0.3], [0.02, -0.36])
const TAIL_WINGS = wings(0.62, [-1.02, -1.42], [-1.26, -1.5])

// The tail fin, seen from the side (x forward, y up), leaning back like the homepage's
const finOutline = new THREE.Shape()
finOutline.moveTo(-0.8, 0.15)
finOutline.lineTo(-1.18, 0.95)
finOutline.quadraticCurveTo(-1.22, 1.03, -1.3, 1.03)
finOutline.lineTo(-1.56, 1.03)
finOutline.quadraticCurveTo(-1.66, 1.03, -1.63, 0.93)
finOutline.lineTo(-1.42, 0.15)
finOutline.closePath()
const FIN = shape(thick(finOutline))

// Round shapes squashed into ovals: the nose cap, the propeller (both blades in one
// piece, through the middle) and the cockpit's glass bubble
const NOSE = shape(new THREE.SphereGeometry(0.37, 24, 16).scale(0.75, 1, 1))
const BLADES = shape(new THREE.CapsuleGeometry(0.07, 0.95, 4, 12).scale(0.45, 1, 1.5))
const CANOPY = shape(new THREE.SphereGeometry(0.3, 24, 16).scale(1.4, 0.75, 0.85))
// The spinner on the propeller, pointing forward
const SPINNER = shape(new THREE.ConeGeometry(0.1, 0.2, 16).rotateZ(-Math.PI / 2))
// A passenger window: a short disc, facing sideways
const WINDOW = shape(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16).rotateX(Math.PI / 2))
// Where the windows go along each side: [x, the body's radius there]
const WINDOWS = [
  [-0.75, 0.41],
  [-0.4, 0.48],
  [-0.05, 0.5],
]

// A part on the plane: toon paint in one color, with its outline as a child (so it moves
// and turns with the part), navy and inside out
type PartProps = ThreeElements["mesh"] & { shape: Shape; color: string }
function Part({ shape, color, ...props }: PartProps) {
  return (
    <mesh geometry={shape.geometry} {...props}>
      <meshToonMaterial color={color} gradientMap={STEPS} />
      <mesh geometry={shape.outline}>
        <meshBasicMaterial color={NAVY_950} side={THREE.BackSide} />
      </mesh>
    </mesh>
  )
}

type PlaneModelProps = ThreeElements["group"] & {
  still?: boolean // no spinning propeller (reduced motion)
}

export function PlaneModel({ still = false, ...props }: PlaneModelProps) {
  const propeller = useRef<THREE.Group>(null)

  // useFrame: runs before every frame is drawn, with the seconds since the last one
  useFrame((_, delta) => {
    if (propeller.current && !still) propeller.current.rotation.x += delta * 14
  })

  return (
    <group {...props}>
      <Part shape={BODY} color={WHITE} />
      <Part shape={NOSE} color={SUN_300} position-x={1.12} />
      <group ref={propeller} position-x={1.42}>
        <Part shape={BLADES} color={NAVY_950} />
        <Part shape={SPINNER} color={SUN_300} position-x={0.06} />
      </group>
      <Part shape={CANOPY} color={SKY_300} position={[0.55, 0.45, 0]} />
      {WINDOWS.flatMap(([x, radius]) =>
        [1, -1].map((side) => (
          <Part
            key={`${x}${side}`}
            shape={WINDOW}
            color={SKY_300}
            position={[x, 0.08, side * radius]}
          />
        )),
      )}
      {/* Wings low on the body, like the homepage's plane */}
      <Part shape={MAIN_WINGS} color={NAVY_600} position-y={-0.2} />
      <Part shape={TAIL_WINGS} color={NAVY_600} position-y={0.05} />
      <Part shape={FIN} color={SKY_300} />
    </group>
  )
}
