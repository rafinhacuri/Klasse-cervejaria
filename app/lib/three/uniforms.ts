import type { Texture } from 'three'
import { Color, Vector2, Vector3 } from 'three'

interface Uniform<T> {
  value: T
}

type Uniforms = Record<string, Uniform<unknown>>

interface RippleUniforms extends Uniforms {
  uState: Uniform<Texture | null>
  uTexel: Uniform<Vector2>
  uAspect: Uniform<number>
  uPointer: Uniform<Vector2>
  uPointerPrev: Uniform<Vector2>
  uPointerForce: Uniform<number>
  uDrop: Uniform<Vector3>
  uSlosh: Uniform<number>
}

interface BeerUniforms extends Uniforms {
  uState: Uniform<Texture | null>
  uTexel: Uniform<Vector2>
  uAspect: Uniform<number>
  uResolution: Uniform<number>
  uTime: Uniform<number>
  uBeer: Uniform<Color>
  uDeep: Uniform<Color>
  uFoam: Uniform<Color>
  uHaze: Uniform<number>
  uDim: Uniform<number>
  uCrown: Uniform<number>
}

interface LiquidUniforms extends Uniforms {
  uLevel: Uniform<number>
  uFoam: Uniform<number>
  uTilt: Uniform<Vector2>
  uTime: Uniform<number>
  uFizz: Uniform<number>
  uBeer: Uniform<Color>
  uDeep: Uniform<Color>
  uFoamColor: Uniform<Color>
}

interface FrostUniforms extends Uniforms {
  uLevel: Uniform<number>
  uCold: Uniform<number>
  uTime: Uniform<number>
}

interface FlowUniforms extends Uniforms {
  uTime: Uniform<number>
  uFront: Uniform<number>
  uTail: Uniform<number>
  uBeer: Uniform<Color>
  uDeep: Uniform<Color>
}

const PILSEN = { color: '#f6b92b', deep: '#7a3c04', foam: '#fff6e2' }

function rippleUniforms(pointer: Vector2, previous: Vector2): RippleUniforms {
  return {
    uState: { value: null },
    uTexel: { value: new Vector2() },
    uAspect: { value: 1 },
    uPointer: { value: pointer },
    uPointerPrev: { value: previous },
    uPointerForce: { value: 0 },
    uDrop: { value: new Vector3() },
    uSlosh: { value: 0 },
  }
}

function beerUniforms(): BeerUniforms {
  return {
    uState: { value: null },
    uTexel: { value: new Vector2() },
    uAspect: { value: 1 },
    uResolution: { value: 1 },
    uTime: { value: 0 },
    uBeer: { value: new Color(PILSEN.color) },
    uDeep: { value: new Color(PILSEN.deep) },
    uFoam: { value: new Color(PILSEN.foam) },
    uHaze: { value: 0 },
    uDim: { value: 0 },
    uCrown: { value: 0 },
  }
}

function liquidUniforms(): LiquidUniforms {
  return {
    uLevel: { value: 0 },
    uFoam: { value: 0 },
    uTilt: { value: new Vector2() },
    uTime: { value: 0 },
    uFizz: { value: 0 },
    uBeer: { value: new Color(PILSEN.color) },
    uDeep: { value: new Color(PILSEN.deep) },
    uFoamColor: { value: new Color(PILSEN.foam) },
  }
}

function frostUniforms(): FrostUniforms {
  return {
    uLevel: { value: 0 },
    uCold: { value: 0 },
    uTime: { value: 0 },
  }
}

function flowUniforms(): FlowUniforms {
  return {
    uTime: { value: 0 },
    uFront: { value: 0 },
    uTail: { value: 0 },
    uBeer: { value: new Color(PILSEN.color) },
    uDeep: { value: new Color(PILSEN.deep) },
  }
}

export type { BeerUniforms, FlowUniforms, FrostUniforms, LiquidUniforms, RippleUniforms }
export { beerUniforms, flowUniforms, frostUniforms, liquidUniforms, rippleUniforms }
