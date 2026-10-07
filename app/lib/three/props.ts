import type { BufferGeometry, Material, Vector2 } from 'three'
import {
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'

import {
  counterFragment,
  frostFragment,
  hoseFragment,
  hoseVertex,
  liquidFragment,
  liquidVertex,
  roomFragment,
  roomVertex,
} from './glsl'
import { VALVE_TOP, frostProfile, kegProfile, liquidProfile, sectionShape } from './shapes'
import type { FlowUniforms, FrostUniforms, LiquidUniforms } from './uniforms'
import { flowUniforms, frostUniforms, liquidUniforms } from './uniforms'

const CUT = { center: 0.15, width: 1.5 }
const LOGO_ANGLE = Math.PI
const DISPLAY_FONT = '"Big Shoulders", "Arial Narrow", sans-serif'
const TAU = Math.PI * 2
const OUTLET = new Vector3(1.48, 3.55, 0)

interface Keg {
  root: Group
  body: Group
  liquid: LiquidUniforms
  frost: FrostUniforms
  logo: Mesh<CylinderGeometry, MeshStandardMaterial>
  seal: Mesh<CylinderGeometry, MeshStandardMaterial>
}

interface Tap {
  root: Group
  lever: Group
  coupler: Group
  flow: FlowUniforms
}

function steel(roughness = 0.24): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: '#dcdde0',
    metalness: 1,
    roughness,
    roughnessMap: brushedTexture(),
    anisotropy: 0.7,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
  })
}

function chrome(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: '#e6e2dc', metalness: 1, roughness: 0.12 })
}

function brass(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: '#d4a443', metalness: 1, roughness: 0.3 })
}

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')
  draw(ctx)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function brushedTexture(): CanvasTexture {
  const texture = canvasTexture(64, 512, (ctx) => {
    ctx.fillStyle = '#8a8a8a'
    ctx.fillRect(0, 0, 64, 512)
    for (let y = 0; y < 512; y++) {
      const shade = 110 + Math.random() * 70
      ctx.fillStyle = `rgb(${shade} ${shade} ${shade} / 0.5)`
      ctx.fillRect(0, y, 64, 1)
    }
  })
  texture.colorSpace = ''
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  ink: string,
  fill: string,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.lineWidth = size * 0.06
  ctx.setLineDash([size * 0.1, size * 0.1])
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.8, 0, TAU)
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.font = `900 ${size * 1.15}px ${DISPLAY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('K', 0, size * 0.06)
  ctx.restore()
}

function drawLogo(ctx: CanvasRenderingContext2D): void {
  const { width, height } = ctx.canvas
  const ink = '#24160c'
  const middle = width / 2
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  drawMark(ctx, middle, height * 0.16, height * 0.12, '#f4b52a', ink)
  ctx.font = `900 ${height * 0.5}px ${DISPLAY_FONT}`
  ctx.fillText('KLASSE', middle, height * 0.76)
  ctx.letterSpacing = `${height * 0.02}px`
  ctx.font = `700 ${height * 0.085}px ${DISPLAY_FONT}`
  ctx.fillText('CERVEJARIA · CHOPE 20 LITROS', middle, height * 0.92)
  ctx.letterSpacing = '0px'
}

function badgeTexture(): CanvasTexture {
  return canvasTexture(256, 256, (ctx) => {
    drawMark(ctx, 128, 128, 120, '#1a0d04', '#f4b52a')
  })
}

function slotTexture(): CanvasTexture {
  const texture = canvasTexture(1024, 128, (ctx) => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 1024, 128)
    ctx.fillStyle = '#000'
    for (const center of [256, 768]) {
      ctx.beginPath()
      ctx.roundRect(center - 70, 34, 140, 46, 23)
      ctx.fill()
    }
  })
  texture.colorSpace = ''
  return texture
}

function knurl<T extends BufferGeometry>(geometry: T, ridges: number, depth: number): T {
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    const radius = Math.hypot(x, z)
    if (radius > 0.01) {
      const angle = Math.atan2(z, x)
      const scale = (radius + Math.sign(Math.sin(angle * ridges)) * depth) / radius
      position.setXYZ(i, x * scale, position.getY(i), z * scale)
    }
  }
  geometry.computeVertexNormals()
  return geometry
}

function opened(points: Vector2[], segments: number): LatheGeometry {
  return new LatheGeometry(points, segments, CUT.center + CUT.width / 2, TAU - CUT.width)
}

function flipped(geometry: ShapeGeometry): ShapeGeometry {
  const index = geometry.getIndex()
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const second = index.getX(i + 1)
      index.setX(i + 1, index.getX(i + 2))
      index.setX(i + 2, second)
    }
  }
  const normal = geometry.getAttribute('normal')
  for (let i = 0; i < normal.count; i++) normal.setZ(i, -normal.getZ(i))
  return geometry
}

function cutFaces(shape: ReturnType<typeof sectionShape>, material: Material): Mesh[] {
  const opening = flipped(new ShapeGeometry(shape, 1)).rotateY(
    CUT.center - CUT.width / 2 - Math.PI / 2,
  )
  const closing = new ShapeGeometry(shape, 1).rotateY(CUT.center + CUT.width / 2 - Math.PI / 2)
  return [new Mesh(opening, material), new Mesh(closing, material)]
}

function liquidMaterial(uniforms: LiquidUniforms): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: liquidVertex,
    fragmentShader: liquidFragment,
    side: DoubleSide,
    uniforms,
  })
}

function frostMaterial(uniforms: FrostUniforms): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: liquidVertex,
    fragmentShader: frostFragment,
    transparent: true,
    depthWrite: false,
    uniforms,
  })
}

function createKeg(): Keg {
  const root = new Group()
  const body = new Group()
  root.add(body)

  const metal = steel()
  const inside = new MeshStandardMaterial({
    color: '#8d8f94',
    metalness: 1,
    roughness: 0.4,
    side: DoubleSide,
  })

  const shell = new Mesh(opened(kegProfile(), 160), metal)
  const shellCuts = cutFaces(sectionShape(kegProfile()), inside)

  const bottomChime = new Mesh(
    new CylinderGeometry(
      0.905,
      0.905,
      0.26,
      128,
      1,
      true,
      CUT.center + CUT.width / 2,
      TAU - CUT.width,
    ).translate(0, 0.13, 0),
    new MeshPhysicalMaterial({ color: '#dcdde0', metalness: 1, roughness: 0.26, side: DoubleSide }),
  )
  const topChime = new Mesh(
    new CylinderGeometry(0.905, 0.905, 0.5, 160, 1, true).translate(0, 2.65, 0),
    new MeshPhysicalMaterial({
      color: '#dcdde0',
      metalness: 1,
      roughness: 0.26,
      roughnessMap: brushedTexture(),
      alphaMap: slotTexture(),
      alphaTest: 0.5,
      side: DoubleSide,
    }),
  )
  const lips = [0.02, 2.9].map((y) => {
    const lip = new Mesh(new TorusGeometry(0.905, 0.028, 16, 160), metal)
    lip.rotation.x = Math.PI / 2
    lip.position.y = y
    return lip
  })

  const valve = new Mesh(new CylinderGeometry(0.2, 0.2, 0.06, 64), chrome())
  valve.position.y = VALVE_TOP - 0.02
  const pin = new Mesh(new CylinderGeometry(0.06, 0.06, 0.04, 32), brass())
  pin.position.y = VALVE_TOP + 0.02
  const spear = new Mesh(new CylinderGeometry(0.04, 0.04, 2.5, 24), chrome())
  spear.position.y = 1.45

  const liquid = liquidUniforms()
  const beerMaterial = liquidMaterial(liquid)
  const beer = new Mesh(opened(liquidProfile(), 128), beerMaterial)
  const beerCuts = cutFaces(sectionShape(liquidProfile(), true), beerMaterial)

  const frost = frostUniforms()
  const condensation = new Mesh(opened(frostProfile(), 128), frostMaterial(frost))

  const logo = new Mesh(
    new CylinderGeometry(0.924, 0.924, 0.78, 96, 1, true, LOGO_ANGLE - 0.8, 1.6),
    new MeshStandardMaterial({
      map: canvasTexture(1400, 640, drawLogo),
      transparent: true,
      metalness: 0.4,
      roughness: 0.55,
    }),
  )
  logo.position.y = 1.485

  const seal = new Mesh(
    knurl(new CylinderGeometry(0.21, 0.21, 0.1, 96, 1), 40, 0.006),
    new MeshStandardMaterial({ color: '#f4b52a', roughness: 0.45 }),
  )
  seal.position.y = VALVE_TOP + 0.06

  body.add(
    shell,
    ...shellCuts,
    bottomChime,
    topChime,
    ...lips,
    valve,
    pin,
    spear,
    beer,
    ...beerCuts,
    condensation,
    logo,
    seal,
  )
  return { root, body, liquid, frost, logo, seal }
}

function hoseCurve(): CatmullRomCurve3 {
  return new CatmullRomCurve3([
    OUTLET.clone(),
    new Vector3(1.2, 3.95, 0.25),
    new Vector3(0.62, 3.85, 0.35),
    new Vector3(0.36, 3.3, 0.12),
    new Vector3(0.26, VALVE_TOP + 0.16, 0),
  ])
}

function createTap(): Tap {
  const root = new Group()
  const metal = chrome()

  const tower = new Mesh(new CylinderGeometry(0.2, 0.26, 4.3, 64), metal)
  tower.position.set(1.7, 2.15, 0)
  const dome = new Mesh(new SphereGeometry(0.2, 48, 24, 0, TAU, 0, Math.PI / 2), metal)
  dome.position.set(1.7, 4.3, 0)
  const foot = new Mesh(new CylinderGeometry(0.42, 0.48, 0.12, 64), metal)
  foot.position.set(1.7, 0.06, 0)
  const outlet = new Mesh(new CylinderGeometry(0.06, 0.06, 0.24, 24), metal)
  outlet.rotation.z = Math.PI / 2
  outlet.position.copy(OUTLET)

  const lever = new Group()
  lever.position.set(1.7, 4.42, 0)
  const collar = new Mesh(new CylinderGeometry(0.12, 0.12, 0.09, 48), brass())
  collar.position.y = 0.045
  const handle = new Mesh(
    new CylinderGeometry(0.105, 0.07, 1.2, 48),
    new MeshPhysicalMaterial({
      color: '#1c120b',
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    }),
  )
  handle.position.y = 0.69
  const badge = new Mesh(
    new CircleGeometry(0.11, 48),
    new MeshStandardMaterial({ map: badgeTexture(), roughness: 0.4 }),
  )
  badge.position.set(0, 0.92, 0.096)
  badge.rotation.x = -0.035
  lever.add(collar, handle, badge)

  const flow = flowUniforms()
  const flowMaterial = new ShaderMaterial({
    vertexShader: hoseVertex,
    fragmentShader: hoseFragment,
    uniforms: flow,
  })

  const coupler = new Group()
  coupler.position.copy(OUTLET)
  const fittings = new Group()
  fittings.position.copy(OUTLET).negate()
  coupler.add(fittings)
  const curve = hoseCurve()
  const hose = new Mesh(
    new TubeGeometry(curve, 96, 0.07, 20),
    new MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.15,
      transmission: 1,
      thickness: 0.05,
      ior: 1.4,
      clearcoat: 1,
    }),
  )
  const beerLine = new Mesh(new TubeGeometry(curve, 96, 0.05, 16), flowMaterial)
  const head = new Mesh(new CylinderGeometry(0.2, 0.22, 0.24, 64), metal)
  head.position.y = VALVE_TOP + 0.14
  const port = new Mesh(new CylinderGeometry(0.05, 0.05, 0.14, 24), metal)
  port.rotation.z = Math.PI / 2
  port.position.set(0.24, VALVE_TOP + 0.16, 0)
  const arm = new Mesh(new CylinderGeometry(0.035, 0.035, 0.42, 16), metal)
  arm.rotation.z = Math.PI / 2
  arm.position.set(-0.36, VALVE_TOP + 0.2, 0)
  const knob = new Mesh(
    new SphereGeometry(0.07, 24, 16),
    new MeshStandardMaterial({ color: '#1c120b', roughness: 0.4 }),
  )
  knob.position.set(-0.58, VALVE_TOP + 0.2, 0)
  fittings.add(hose, beerLine, head, port, arm, knob)

  root.add(tower, dome, foot, outlet, lever, coupler)
  return { root, lever, coupler, flow }
}

function createRoom(): Mesh<PlaneGeometry, ShaderMaterial> {
  const room = new Mesh(
    new PlaneGeometry(48, 28),
    new ShaderMaterial({
      vertexShader: roomVertex,
      fragmentShader: roomFragment,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 48 / 28 },
        uGlow: { value: new Color('#6a3510') },
        uDark: { value: new Color('#140902') },
      },
    }),
  )
  room.position.set(0, 3, -10)
  return room
}

function createCounter(): Mesh<CircleGeometry, ShaderMaterial> {
  const counter = new Mesh(
    new CircleGeometry(7, 96),
    new ShaderMaterial({
      vertexShader: roomVertex,
      fragmentShader: counterFragment,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new Color('#1d0f06') } },
    }),
  )
  counter.rotation.x = -Math.PI / 2
  counter.position.y = -0.01
  return counter
}

export type { Keg, Tap }
export { CUT, LOGO_ANGLE, createCounter, createKeg, createRoom, createTap, drawLogo }
