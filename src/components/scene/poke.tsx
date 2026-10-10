"use client"

import { useState, type AnimationEvent, type ReactNode } from "react"

type PokeProps = {
  // With a label: a real <button> (keyboard + screen readers), like the beach ball.
  // Without one: pure decoration (aria-hidden, mouse and touch only), like the palm.
  label?: string
  animation: string // the @keyframes name that ends the play (e.g. "bounce-once")
  playOnHover?: boolean // also play when the pointer comes over it
  className?: string
  children: ReactNode
}

// A toy that plays a one-shot animation each time it's poked. Poking only sets
// data-playing; the CSS decides what plays: data-playing:animate-hop on the toy
// itself, or group-data-playing:animate-bounce-once on a child. When that
// animation ends, the attribute goes away so the next poke can play it again.
// CSS alone can't do this: :active lasts only while the button is held down, and
// setting the same animation again doesn't restart it.
export function Poke({
  label,
  animation,
  playOnHover = false,
  className = "",
  children,
}: PokeProps) {
  const [playing, setPlaying] = useState(false)
  const play = () => setPlaying(true)

  const props = {
    "data-playing": playing ? "" : undefined,
    className: `group ${className}`,
    onClick: play,
    onPointerEnter: playOnHover ? play : undefined,
    // animationend bubbles up from every animation inside, so wait for ours
    onAnimationEnd: (event: AnimationEvent<HTMLElement>) => {
      if (event.animationName === animation) setPlaying(false)
    },
  }

  return label ? (
    <button type="button" aria-label={label} {...props}>
      {children}
    </button>
  ) : (
    <span aria-hidden {...props}>
      {children}
    </span>
  )
}
