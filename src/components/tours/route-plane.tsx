import { PlaneTop } from "@/components/scene/plane"
import type { Pose } from "@/components/tours/flight"

// The flat plane, for reduced motion and browsers that can't draw 3D: it waits at the start
// of the flight (on the departure cloud, or at the top of the phones' gutter), its nose
// along the trail. The 3D plane is the one that flies (src/components/three/flight-scene.tsx).
// heading is counterclockwise with y going up; CSS turns clockwise with y going down, so
// it's turned by minus the heading.
export function RoutePlane({ x, y, heading }: Pick<Pose, "x" | "y" | "heading">) {
  return (
    <div
      aria-hidden
      style={{ left: x, top: y, transform: `translate(-50%, -50%) rotate(${-heading}rad)` }}
      className="pointer-events-none absolute w-10 md:w-12 lg:w-16"
    >
      <PlaneTop className="block w-full" />
    </div>
  )
}
