<script setup lang="ts">
  const model = defineModel<number>({ required: true })

  const props = defineProps({
    label: { type: String, required: true },
    unit: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, default: 1 },
  })

  const value = computed({
    get: () => [model.value],
    set: (next: number[] | undefined) => {
      const [first] = next ?? []
      if (first !== undefined) model.value = first
    },
  })
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between">
      <p class="font-mono text-micro text-muted uppercase" aria-hidden="true">{{ props.label }}</p>
      <p class="font-display text-[1.75rem] leading-none font-bold tabular-nums">
        {{ model }}
        <span class="text-base font-semibold text-muted">{{ props.unit }}</span>
      </p>
    </div>
    <SliderRoot
      v-model="value"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      class="relative mt-4 flex h-6 w-full touch-none items-center select-none">
      <SliderTrack class="relative h-1.5 grow overflow-hidden rounded-full bg-fg/12">
        <SliderRange class="absolute h-full rounded-full bg-linear-to-r from-amber to-gold" />
      </SliderTrack>
      <SliderThumb
        class="block size-6 rounded-full border-4 border-ink bg-fg shadow-float transition-transform duration-150 hover:scale-110 active:scale-95"
        :aria-label="props.label" />
    </SliderRoot>
  </div>
</template>
