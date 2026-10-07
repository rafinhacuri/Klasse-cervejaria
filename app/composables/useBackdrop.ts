import type { MaybeRefOrGetter } from 'vue'

interface Mood {
  beer: MaybeRefOrGetter<string>
  dim: number
}

interface Stage extends Mood {
  id: number
  el: HTMLElement
}

const stages = shallowRef<Stage[]>([])
let nextId = 0

function useBackdrop(target: MaybeRefOrGetter<HTMLElement | null | undefined>, mood: Mood): void {
  nextId += 1
  const id = nextId

  onMounted(() => {
    const el = toValue(target)
    if (el) stages.value = [...stages.value, { ...mood, id, el }]
  })

  onBeforeUnmount(() => {
    stages.value = stages.value.filter((stage) => stage.id !== id)
  })
}

function currentMood(viewport: number): { beer: string; dim: number } {
  const middle = viewport / 2
  let best: Mood = { beer: 'pilsen', dim: 0 }
  let distance = Infinity

  for (const stage of stages.value) {
    const rect = stage.el.getBoundingClientRect()
    const gap = rect.top > middle ? rect.top - middle : Math.max(0, middle - rect.bottom)
    if (gap < distance) {
      distance = gap
      best = stage
    }
  }

  return { beer: toValue(best.beer), dim: best.dim }
}

export { currentMood, useBackdrop }
