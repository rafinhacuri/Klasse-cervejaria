function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max)
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export { clamp, mix, smoothstep }
