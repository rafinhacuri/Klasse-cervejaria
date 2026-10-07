import { Shape, Vector2 } from 'three'

import { pick } from '~/utils/pick'

type Point = [number, number]

const KEG_OUTLINE: Point[] = [
  [0, 0.16],
  [0.6, 0.19],
  [0.86, 0.24],
  [0.92, 0.3],
  [0.92, 0.85],
  [0.955, 0.9],
  [0.955, 0.97],
  [0.92, 1.02],
  [0.92, 1.95],
  [0.955, 2],
  [0.955, 2.07],
  [0.92, 2.12],
  [0.92, 2.42],
  [0.86, 2.5],
  [0.6, 2.56],
  [0.24, 2.6],
  [0.18, 2.64],
  [0.18, 2.74],
]

const WALL = 0.03
const VALVE_TOP = 2.74
const KEG_FULL = 0.97

function catmull(a: number, b: number, c: number, d: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  )
}

function smooth(points: Point[], steps = 6): Vector2[] {
  const result: Vector2[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const [r0, y0] = pick(points, i - 1)
    const [r1, y1] = pick(points, i)
    const [r2, y2] = pick(points, i + 1)
    const [r3, y3] = pick(points, i + 2)
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const radius = catmull(r0, r1, r2, r3, t)
      result.push(new Vector2(Math.max(radius, 0), catmull(y0, y1, y2, y3, t)))
    }
  }
  const [r, y] = pick(points, points.length - 1)
  result.push(new Vector2(r, y))
  return result
}

function inset(points: Vector2[], distance: number): Vector2[] {
  return points.map((point, i) => {
    const tangent = pick(points, i + 1)
      .clone()
      .sub(pick(points, i - 1))
      .normalize()
    const normal = new Vector2(tangent.y, -tangent.x)
    return new Vector2(Math.max(point.x - normal.x * distance, 0), point.y - normal.y * distance)
  })
}

function kegProfile(): Vector2[] {
  const outer = smooth(KEG_OUTLINE)
  return [...outer, ...inset(outer, WALL).toReversed()]
}

function frostProfile(): Vector2[] {
  return inset(smooth(KEG_OUTLINE), -0.004).filter((point) => point.y < 2.46)
}

function liquidProfile(): Vector2[] {
  return inset(smooth(KEG_OUTLINE), WALL + 0.008).filter((point) => point.y < 2.6)
}

function sectionShape(profile: Vector2[], closeOnAxis = false): Shape {
  if (!closeOnAxis) return new Shape(profile)
  const first = pick(profile, 0)
  const last = pick(profile, profile.length - 1)
  return new Shape([...profile, new Vector2(0, last.y), new Vector2(0, first.y)])
}

function radiusAt(profile: Vector2[], height: number): number {
  for (let i = 1; i < profile.length; i++) {
    const below = pick(profile, i - 1)
    const above = pick(profile, i)
    if (height <= above.y && above.y > below.y) {
      const t = Math.max(0, (height - below.y) / (above.y - below.y))
      return below.x + (above.x - below.x) * t
    }
  }
  return pick(profile, profile.length - 1).x
}

function fillCurve(profile: Vector2[], samples = 200): (fraction: number) => number {
  const bottom = pick(profile, 0).y
  const top = pick(profile, profile.length - 1).y
  const step = (top - bottom) / samples
  const volumes = [0]
  for (let i = 1; i <= samples; i++) {
    const radius = radiusAt(profile, bottom + step * (i - 0.5))
    volumes.push(pick(volumes, i - 1) + radius * radius * step)
  }
  const total = pick(volumes, volumes.length - 1)

  return (fraction) => {
    const target = Math.min(Math.max(fraction, 0), 1) * total
    const index = volumes.findIndex((volume) => volume >= target)
    if (index <= 0) return bottom
    const before = pick(volumes, index - 1)
    const t = (target - before) / (pick(volumes, index) - before || 1)
    return bottom + step * (index - 1 + t)
  }
}

export { KEG_FULL, VALVE_TOP, fillCurve, frostProfile, kegProfile, liquidProfile, sectionShape }
