import type { Texture } from 'three'
import {
  Color,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three'

import type { Beer } from '~/data/content'

import { beerFragment, fullscreenVertex, rippleFragment } from './glsl'
import { Spring } from './spring'
import type { RippleUniforms } from './uniforms'
import { beerUniforms, rippleUniforms } from './uniforms'

interface SurfaceFrame {
  beer: Beer
  dim: number
  calm: boolean
}

const RIPPLE_SIZE = 320
const RIPPLE_STEPS = 2
const BUBBLE_POPS_PER_SECOND = 5

function createTarget(width: number, height: number): WebGLRenderTarget {
  return new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  })
}

class Surface {
  private readonly renderer: WebGLRenderer
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly scene = new Scene()
  private readonly quad: Mesh<PlaneGeometry, ShaderMaterial>
  private readonly ripple: ShaderMaterial
  private readonly beer: ShaderMaterial
  private readonly rippling: RippleUniforms
  private readonly pouring = beerUniforms()
  private readonly palette = { beer: new Color(), deep: new Color(), foam: new Color() }
  private targets: [WebGLRenderTarget, WebGLRenderTarget]
  private readonly pointer = { current: new Vector2(-1, -1), previous: new Vector2(-1, -1) }
  private force = 0
  private time = 0
  private readonly haze = new Spring(0)
  private readonly dim = new Spring(0)
  private readonly crown = new Spring(0)

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.targets = [createTarget(2, 2), createTarget(2, 2)]

    this.rippling = rippleUniforms(this.pointer.current, this.pointer.previous)
    this.ripple = new ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: rippleFragment,
      uniforms: this.rippling,
    })

    this.beer = new ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: beerFragment,
      uniforms: this.pouring,
    })

    this.quad = new Mesh(new PlaneGeometry(2, 2), this.ripple)
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }

  resize(width: number, height: number, dpr: number): void {
    const aspect = width / height
    this.renderer.setPixelRatio(Math.min(dpr, width < 768 ? 1.25 : 1.5) * 0.85)
    this.renderer.setSize(width, height, false)

    const simWidth = Math.round(aspect >= 1 ? RIPPLE_SIZE : RIPPLE_SIZE * aspect)
    const simHeight = Math.round(aspect >= 1 ? RIPPLE_SIZE / aspect : RIPPLE_SIZE)
    for (const target of this.targets) target.setSize(simWidth, simHeight)
    this.clearTargets()

    this.pouring.uResolution.value = this.renderer.getDrawingBufferSize(new Vector2()).y
    for (const uniforms of [this.rippling, this.pouring]) {
      uniforms.uTexel.value.set(1 / simWidth, 1 / simHeight)
      uniforms.uAspect.value = aspect
    }
  }

  touch(x: number, y: number, speed: number): void {
    if (this.pointer.current.x < 0) this.pointer.previous.set(x, y)
    this.pointer.current.set(x, y)
    this.force = Math.min(this.force + speed * 0.9, 1.4)
  }

  release(): void {
    this.pointer.current.set(-1, -1)
    this.pointer.previous.set(-1, -1)
  }

  frame(delta: number, input: SurfaceFrame): void {
    const dt = Math.min(delta, 1 / 30)
    this.time += input.calm ? dt * 0.15 : dt

    this.blend(dt, input)
    if (!input.calm) this.simulate(dt)

    this.pouring.uState.value = this.state
    this.pouring.uTime.value = this.time
    this.quad.material = this.beer
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    for (const target of this.targets) target.dispose()
    this.quad.geometry.dispose()
    this.ripple.dispose()
    this.beer.dispose()
    this.renderer.dispose()
  }

  private get state(): Texture {
    return this.targets[0].texture
  }

  private blend(dt: number, { beer, dim }: SurfaceFrame): void {
    const amount = 1 - Math.exp(-dt * 2.6)
    const uniforms = this.pouring
    uniforms.uBeer.value.lerp(this.palette.beer.set(beer.color), amount)
    uniforms.uDeep.value.lerp(this.palette.deep.set(beer.deep), amount)
    uniforms.uFoam.value.lerp(this.palette.foam.set(beer.foam), amount)
    uniforms.uHaze.value = this.haze.step(beer.haze, dt, 3)
    uniforms.uDim.value = this.dim.step(dim, dt, 3.5)
    uniforms.uCrown.value = this.crown.step(0.17 - dim * 0.06, dt, 2)
  }

  private simulate(dt: number): void {
    const uniforms = this.rippling
    const pop = Math.random() < dt * BUBBLE_POPS_PER_SECOND
    uniforms.uDrop.value.set(Math.random(), Math.random(), pop ? 0.25 + Math.random() * 0.35 : 0)
    uniforms.uPointerForce.value = this.pointer.current.x < 0 ? 0 : this.force

    this.quad.material = this.ripple
    for (let step = 0; step < RIPPLE_STEPS; step++) {
      uniforms.uState.value = this.state
      this.renderer.setRenderTarget(this.targets[1])
      this.renderer.render(this.scene, this.camera)
      this.targets = [this.targets[1], this.targets[0]]
      uniforms.uDrop.value.z = 0
    }

    this.pointer.previous.copy(this.pointer.current)
    this.force *= Math.exp(-dt * 10)
  }

  private clearTargets(): void {
    for (const target of this.targets) {
      this.renderer.setRenderTarget(target)
      this.renderer.clear()
    }
    this.renderer.setRenderTarget(null)
  }
}

export type { SurfaceFrame }
export { Surface }
