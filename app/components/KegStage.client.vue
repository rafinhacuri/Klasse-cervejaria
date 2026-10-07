<script setup lang="ts">
  import { beerById } from '~/data/content'
  import type { KegScene } from '~/lib/three/keg'

  const props = defineProps({
    progress: { type: Number, required: true },
    beer: { type: String, required: true },
  })

  const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
  const ready = ref(false)
  const visible = useElementVisibility(canvas)
  const visibility = useDocumentVisibility()
  const reducedMotion = usePreferredReducedMotion()
  const { width, height } = useWindowSize()
  const { pixelRatio } = useDevicePixelRatio()

  let scene: KegScene | null = null
  let pointer: { x: number; y: number } | null = null

  const { pause, resume } = useRafFn(
    ({ delta }) => {
      if (!scene) return
      scene.frame(delta / 1000, {
        progress: props.progress,
        beer: beerById(props.beer),
        pointer,
        calm: reducedMotion.value === 'reduce',
      })
      ready.value = true
    },
    { immediate: false },
  )

  const active = computed(() => visible.value && visibility.value === 'visible')

  watch(active, (on) => {
    if (on && scene) resume()
    else pause()
  })

  watch([width, height, pixelRatio], () => {
    scene?.resize(width.value, height.value, pixelRatio.value)
  })

  useEventListener(
    globalThis,
    'pointermove',
    (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer = {
        x: (event.clientX / width.value) * 2 - 1,
        y: -((event.clientY / height.value) * 2 - 1),
      }
    },
    { passive: true },
  )

  onMounted(async () => {
    if (!document.createElement('canvas').getContext('webgl2')) return
    const element = await until(canvas).toBeTruthy()
    try {
      const { KegScene } = await import('~/lib/three/keg')
      scene = new KegScene(element)
    } catch (error) {
      console.error('Keg scene unavailable, continuing without it.', error)
      return
    }
    scene.resize(width.value, height.value, pixelRatio.value)
    if (active.value) resume()
  })

  onBeforeUnmount(() => {
    pause()
    scene?.dispose()
    scene = null
  })
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" class="canvas-fade h-dvh w-full" :data-ready="ready" />
</template>
