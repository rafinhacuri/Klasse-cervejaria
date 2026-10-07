import { kegSizes } from '~/data/content'

const paces = ['calm', 'lively', 'endless'] as const

type Pace = (typeof paces)[number]

const known = new Set<unknown>(paces)

function isPace(value: unknown): value is Pace {
  return known.has(value)
}

const litersPerHour: Record<Pace, number> = {
  calm: 0.3,
  lively: 0.45,
  endless: 0.6,
}

function partyLiters(guests: number, hours: number, pace: Pace): number {
  return Math.ceil((guests * hours * litersPerHour[pace]) / 10) * 10
}

function combinations(liters: number, sizes: number[]): number[][] {
  const [size, ...rest] = sizes
  if (size === undefined) return [[]]
  const most = Math.ceil(liters / size)
  const result: number[][] = []
  for (let count = 0; count <= most; count++) {
    const left = Math.max(liters - count * size, 0)
    const head = Array.from({ length: count }, () => size)
    for (const tail of combinations(left, rest)) {
      result.push([...head, ...tail])
    }
  }
  return result
}

function total(kegs: number[]): number {
  return kegs.reduce((sum, size) => sum + size, 0)
}

function kegsFor(liters: number): number[] {
  const options = combinations(liters, kegSizes).filter((kegs) => total(kegs) >= liters)
  options.sort((a, b) => total(a) - total(b) || a.length - b.length)
  return options[0] ?? []
}

function groupKegs(kegs: number[]): { size: number; count: number }[] {
  const counts = new Map<number, number>()
  for (const size of kegs) counts.set(size, (counts.get(size) ?? 0) + 1)
  return [...counts].map(([size, count]) => ({ size, count }))
}

export type { Pace }
export { groupKegs, isPace, kegsFor, partyLiters, paces }
