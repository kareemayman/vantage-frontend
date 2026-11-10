// Pushes apart any two points closer than `room`, each half the way, along the line between
// them, so the pins drawn there don't cover each other. It goes over every pair a few times,
// because a push can bring a pin too close to a third one. Two points in exactly the same spot
// are pushed apart sideways. It moves the points themselves (it doesn't return new ones).
// Used by the journal's pencil map and the homepage's globe.
export function spread(points: { x: number; y: number }[], room: number) {
  for (let round = 0; round < 10; round++) {
    let moved = false
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const [a, b] = [points[i], points[j]]
        const gap = Math.hypot(b.x - a.x, b.y - a.y)
        // A hair under `room` is enough: a pair pushed to exactly 40 apart can measure
        // 39.99999999999999, and it would be pushed again every round
        if (gap > room - 0.01) continue
        // The way from a to b, as a step 1 unit long
        const [stepX, stepY] = gap ? [(b.x - a.x) / gap, (b.y - a.y) / gap] : [1, 0]
        const push = (room - gap) / 2
        a.x -= stepX * push
        a.y -= stepY * push
        b.x += stepX * push
        b.y += stepY * push
        moved = true
      }
    }
    if (!moved) return
  }
}
