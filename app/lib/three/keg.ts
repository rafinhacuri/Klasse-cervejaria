import type { Object3D, Texture } from 'three'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  SpotLight,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

import type { Beer } from '~/data/content'
import type { PourState } from '~/utils/pour'
import { pourState } from '~/utils/pour'

import type { Keg, Tap } from './props'
import { CUT, createCounter, createKeg, createRoom, createTap, drawLogo } from './props'
import { KEG_FULL, VALVE_TOP, fillCurve, liquidProfile } from './shapes'
import { Slosh } from './slosh'
import { Spring } from './spring'

interface PourFrame {
  progress: number
  beer: Beer
  pointer: { x: number; y: number } | null
  calm: boolean
}

const FOV = 30
const CAMERA = { y: 3.4, z: 14.5, look: 2.3 }
const FONT = '900 64px "Big Shoulders"'
const START_SPIN = -CUT.center - 0.25
const END_SPIN = Math.PI * 2 - Math.PI

function isMesh(object: Object3D): object is Mesh {
  return object instanceof Mesh
}

function dispose(object: Object3D): void {
  if (!isMesh(object)) return
  object.geometry.dispose()
  const materials = Array.isArray(object.material) ? object.material : [object.material]
  for (const material of materials) {
    if (material instanceof MeshStandardMaterial) {
      for (const map of [material.map, material.roughnessMap, material.alphaMap]) map?.dispose()
    }
    material.dispose()
  }
}

class KegScene {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 60)
  private readonly pmrem: PMREMGenerator
  private readonly environment: Texture
  private readonly keg: Keg = createKeg()
  private readonly tap: Tap = createTap()
  private readonly room = createRoom()
  private readonly counter = createCounter()
  private readonly levelFor = fillCurve(liquidProfile())
  private readonly progress = new Spring(0)
  private readonly camX = new Spring(0)
  private readonly camY = new Spring(0)
  private readonly slosh = { x: new Slosh(), z: new Slosh() }
  private readonly stage = { x: 0, scale: 1 }
  private readonly palette = {
    beer: new Color('#f6b92b'),
    deep: new Color('#7a3c04'),
    foam: new Color('#fff6e2'),
  }
  private readonly target = new Color()
  private lastX = 0
  private lastVelocity = 0
  private spin = START_SPIN
  private time = 0

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = NeutralToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.pmrem = new PMREMGenerator(this.renderer)
    this.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = this.environment
    this.scene.environmentIntensity = 0.9

    const key = new DirectionalLight('#ffe2b0', 2.4)
    key.position.set(-4, 7, 6)
    const rim = new SpotLight('#ffb35c', 60, 30, 0.55, 0.8)
    rim.position.set(3, 6, -6)
    rim.target.position.set(0, 1.5, 0)
    this.scene.add(new AmbientLight('#3a1d08', 1.4), key, rim, rim.target)

    this.scene.add(this.room, this.counter, this.tap.root, this.keg.root)
    this.camera.position.set(0, CAMERA.y, CAMERA.z)

    void this.loadFonts()
  }

  resize(width: number, height: number, dpr: number): void {
    this.renderer.setPixelRatio(Math.min(dpr, width < 768 ? 1.5 : 1.75))
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    const visibleHeight = 2 * Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA.z
    const visibleWidth = visibleHeight * this.camera.aspect
    const wide = width >= 1024
    this.stage.scale = Math.min(1, visibleWidth / 4.8)
    this.stage.x = wide ? visibleWidth * 0.17 : -0.55 * this.stage.scale
  }

  frame(delta: number, input: PourFrame): void {
    const dt = Math.min(delta, 1 / 30)
    this.time += input.calm ? dt * 0.3 : dt

    const progress = this.progress.step(input.progress, dt, input.calm ? 30 : 7)
    const state = pourState(progress)

    this.tint(dt, input.beer)
    this.place(state)
    this.pour(dt, state)
    this.moveCamera(dt, input)

    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.scene.traverse(dispose)
    this.environment.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }

  private async loadFonts(): Promise<void> {
    try {
      await document.fonts.load(FONT)
    } catch {
      return
    }
    const logo = this.keg.logo.material.map
    if (!logo || !(logo.image instanceof HTMLCanvasElement)) return
    const ctx = logo.image.getContext('2d')
    if (!ctx) return
    drawLogo(ctx)
    logo.needsUpdate = true
  }

  private tint(dt: number, beer: Beer): void {
    const amount = 1 - Math.exp(-dt * 4)
    this.palette.beer.lerp(this.target.set(beer.color), amount)
    this.palette.deep.lerp(this.target.set(beer.deep), amount)
    this.palette.foam.lerp(this.target.set(beer.foam), amount)

    const { liquid } = this.keg
    liquid.uBeer.value.copy(this.palette.beer)
    liquid.uDeep.value.copy(this.palette.deep)
    liquid.uFoamColor.value.copy(this.palette.foam)

    const { flow } = this.tap
    flow.uBeer.value.copy(this.palette.beer)
    flow.uDeep.value.copy(this.palette.deep)
  }

  private place(state: PourState): void {
    const { root, body, seal } = this.keg
    const { scale, x } = this.stage

    this.tap.root.scale.setScalar(scale)
    this.tap.root.position.set(x, 0, 0)
    this.tap.coupler.rotation.z = -0.32 * state.lift
    this.room.position.x = x * 0.4

    root.scale.setScalar(scale * (1 + state.slide * 0.1))
    root.position.set(x - state.slide * 1.3 * scale, 0, state.slide * 1.6)
    this.counter.position.set(root.position.x, -0.01, root.position.z)

    const idle = Math.sin(this.time * 0.35) * 0.12
    this.spin = MathUtils.lerp(
      START_SPIN + idle,
      END_SPIN + idle * 0.4,
      MathUtils.smootherstep(state.turn, 0, 1),
    )
    body.rotation.y = this.spin

    seal.visible = state.seal > 0.001
    seal.position.y = VALVE_TOP + 0.06 + (1 - state.seal) ** 2 * 2.4
    seal.rotation.y = (1 - state.seal) * Math.PI * 3
  }

  private pour(dt: number, state: PourState): void {
    const { liquid, frost } = this.keg
    const { flow } = this.tap

    this.tap.lever.rotation.x = state.open * 0.72

    const level = state.fill > 0.001 ? this.levelFor(state.fill * KEG_FULL) : 0
    const foam = Math.min(
      0.04 + state.head * 0.14 + state.open * 0.05,
      Math.max(level - 0.2, 0) * 0.5,
    )
    liquid.uLevel.value = level
    liquid.uFoam.value = foam
    liquid.uTime.value = this.time
    liquid.uFizz.value = state.open

    frost.uLevel.value = level - foam
    frost.uCold.value = MathUtils.smoothstep(state.fill, 0, 0.08)
    frost.uTime.value = this.time

    flow.uFront.value = state.front
    flow.uTail.value = state.tail
    flow.uTime.value = this.time

    this.wobble(dt, state)
  }

  private wobble(dt: number, state: PourState): void {
    const { x } = this.keg.root.position
    const velocity = (x - this.lastX) / Math.max(dt, 1e-3)
    const acceleration = (velocity - this.lastVelocity) / Math.max(dt, 1e-3)
    this.lastX = x
    this.lastVelocity = velocity

    const swirl = state.open * Math.sin(this.time * 9) * 0.5
    const tiltX = this.slosh.x.step(MathUtils.clamp(-acceleration * 0.3, -6, 6) + swirl, dt)
    const tiltZ = this.slosh.z.step(state.open * Math.cos(this.time * 7.3) * 0.4, dt)

    const angle = this.spin
    const tilt = this.keg.liquid.uTilt.value
    tilt.x = Math.cos(angle) * tiltX - Math.sin(angle) * tiltZ
    tilt.y = Math.sin(angle) * tiltX + Math.cos(angle) * tiltZ
  }

  private moveCamera(dt: number, input: PourFrame): void {
    const pointer = input.pointer && !input.calm ? input.pointer : { x: 0, y: 0 }
    this.camera.position.x = this.camX.step(pointer.x * 0.6, dt, 2.5)
    this.camera.position.y = CAMERA.y + this.camY.step(pointer.y * 0.35, dt, 2.5)
    this.camera.lookAt(this.stage.x * 0.35, CAMERA.look, 0)
  }
}

export type { PourFrame }
export { KegScene }
