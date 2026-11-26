import { useSyncExternalStore } from "react"

// Is this device up to drawing 3D: more than 2 processor cores, and WebGL 2? Asked once, in
// the browser. useSyncExternalStore reads it the way useReducedMotion reads the motion
// setting; the server can't know, so it says no. Used by the tours page's flight and the
// waiting room's plane: without 3D, both keep their flat drawings.
let capable: boolean | undefined
const canDraw3D = () =>
  (capable ??=
    navigator.hardwareConcurrency > 2 &&
    Boolean(document.createElement("canvas").getContext("webgl2")))
const neverChanges = () => () => {}

export function useCanDraw3D() {
  return useSyncExternalStore(neverChanges, canDraw3D, () => false)
}
