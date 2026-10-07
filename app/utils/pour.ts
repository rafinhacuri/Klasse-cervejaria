import { smoothstep } from './math'

interface PourState {
  open: number
  front: number
  tail: number
  fill: number
  head: number
  lift: number
  slide: number
  seal: number
  turn: number
}

const KEG_LITERS = 20

function pourState(progress: number): PourState {
  return {
    open: smoothstep(0.1, 0.16, progress) * (1 - smoothstep(0.66, 0.7, progress)),
    front: smoothstep(0.13, 0.2, progress),
    tail: smoothstep(0.67, 0.73, progress),
    fill: smoothstep(0.18, 0.7, progress),
    head: smoothstep(0.3, 0.7, progress),
    lift: smoothstep(0.72, 0.78, progress),
    slide: smoothstep(0.76, 0.86, progress),
    seal: smoothstep(0.84, 0.92, progress),
    turn: smoothstep(0.84, 1, progress),
  }
}

function pouredLiters(progress: number): number {
  return pourState(progress).fill * KEG_LITERS
}

export type { PourState }
export { KEG_LITERS, pourState, pouredLiters }
