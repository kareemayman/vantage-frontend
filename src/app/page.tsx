// Temporary font check. Replaced by the real homepage in the base-layout step.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="font-display text-7xl font-bold tracking-tight uppercase">
        Summer starts here
      </h1>
      <p className="-rotate-2 font-hand text-3xl">psst... try grabbing the beach ball</p>
      <p className="text-lg leading-relaxed">
        Explore the jaw-dropping US east coast by foot and by boat. Seven days of turquoise water,
        coral reefs and island sunsets, with guides who know every hidden beach.
      </p>
    </main>
  )
}
