// How fast the mouse wheel scrolls: 1 is normal, 0.5 is half speed. <SmoothScroll /> multiplies
// every turn of the wheel by it, and a page that wants slower scrolling sets it from an
// effect, and puts it back to 1 in the effect's cleanup (which also runs when the page is
// hidden). Touch, the keyboard and the scrollbar stay native, so they aren't affected.
export const wheelPace = { current: 1 }
