// Difficulty colors, for the luggage tags (homepage) and the tour cards (/tours). The stamp
// is a physical object, so it looks the same in both themes; the chip uses theme tokens.
// ("difficult" isn't in the design: coral, like a warning.)
export const DIFFICULTY = {
  easy: {
    stamp: "border-lagoon-700 bg-lagoon-50 text-lagoon-700",
    chip: "bg-success-soft text-success",
  },
  medium: {
    stamp: "border-navy-950 bg-white text-navy-950",
    chip: "bg-chip text-chip-foreground",
  },
  difficult: {
    stamp: "border-coral-700 bg-coral-50 text-coral-700",
    chip: "bg-destructive-soft text-destructive",
  },
}
