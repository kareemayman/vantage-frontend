import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// GSAP plugins must be registered before use. Registering them here, once, and importing
// gsap from this file guarantees that everywhere.
// ScrollTrigger: ties animations to scrolling. MotionPath: moves things along an SVG path.
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP)

export { gsap, ScrollTrigger, useGSAP }
