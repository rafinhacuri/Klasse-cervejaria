<script setup lang="ts">
  import { beerById } from '~/data/content'
  import type { Surface } from '~/lib/three/surface'

  const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
  const ready = ref(false)
  const reducedMotion = usePreferredReducedMotion()
  const visibility = useDocumentVisibility()
  const { width, height } = useWindowSize()
  const { pixelRatio } = useDevicePixelRatio()

  let surface: Surface | null = null
  let lastPointer = { x: 0, y: 0, time: 0 }

  const { pause, resume } = useRafFn(
    ({ delta }) => {
      if (!surface) return
      const mood = currentMood(height.value)
      surface.frame(delta / 1000, {
        beer: beerById(mood.beer),
        dim: mood.dim,
        calm: reducedMotion.value === 'reduce',
      })
      ready.value = true
    },
    { immediate: false },
  )

  function onPointer(event: PointerEvent): void {
    if (!surface) return
    const now = performance.now()
    const elapsed = Math.max(now - lastPointer.time, 8)
    const distance = Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y)
    lastPointer = { x: event.clientX, y: event.clientY, time: now }
    const speed = Math.min(distance / elapsed, 4) * 0.35
    surface.touch(event.clientX / width.value, 1 - event.clientY / height.value, speed)
  }

  useEventListener(globalThis, 'pointermove', onPointer, { passive: true })
  useEventListener(document, 'pointerleave', () => surface?.release())

  watch(visibility, (state) => {
    if (state === 'visible' && surface) resume()
    else pause()
  })

  watch([width, height, pixelRatio], () => {
    surface?.resize(width.value, height.value, pixelRatio.value)
  })

  onMounted(async () => {
    if (!document.createElement('canvas').getContext('webgl2')) return
    const element = await until(canvas).toBeTruthy()
    try {
      const { Surface } = await import('~/lib/three/surface')
      surface = new Surface(element)
    } catch (error) {
      console.error('Beer surface unavailable, continuing without it.', error)
      return
    }
    surface.resize(width.value, height.value, pixelRatio.value)
    if (visibility.value === 'visible') resume()
  })

  onBeforeUnmount(() => {
    pause()
    surface?.dispose()
    surface = null
  })
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 bg-bg">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#8a4a0c,#1a0d04_75%)]" />
    <canvas ref="canvas" class="canvas-fade absolute inset-0 h-dvh w-full" :data-ready="ready" />
  </div>
</template>
