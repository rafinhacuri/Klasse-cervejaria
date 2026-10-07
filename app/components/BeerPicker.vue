<script setup lang="ts">
  import { beers } from '~/data/content'

  const model = defineModel<string>({ required: true })

  const props = defineProps({
    label: { type: String, required: true },
    only: { type: Array as PropType<string[]>, default: () => [] },
  })

  const options = computed(() =>
    props.only.length > 0 ? beers.filter((beer) => props.only.includes(beer.id)) : beers,
  )

  function select(value: unknown): void {
    if (typeof value === 'string' && value) model.value = value
  }
</script>

<template>
  <ToggleGroupRoot
    :model-value="model"
    type="single"
    :aria-label="props.label"
    class="flex flex-wrap gap-1 rounded-full border border-line bg-ink/40 p-1 backdrop-blur-md"
    @update:model-value="select">
    <ToggleGroupItem
      v-for="beer in options"
      :key="beer.id"
      :value="beer.id"
      class="relative flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-medium text-muted transition-colors duration-200 hover:text-fg data-[state=on]:text-ink">
      <Motion
        v-if="model === beer.id"
        as="span"
        :layout-id="`picker-${props.label}`"
        class="absolute inset-0 rounded-full bg-fg"
        :transition="{ type: 'spring', bounce: 0.15, duration: 0.45 }" />
      <span
        class="relative size-2.5 rounded-full ring-1 ring-fg/30"
        :style="{ backgroundColor: beer.color }" />
      <span class="relative">{{ beer.name }}</span>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
