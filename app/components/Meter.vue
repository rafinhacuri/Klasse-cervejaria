<script setup lang="ts">
  const props = defineProps({
    label: { type: String, required: true },
    value: { type: Number, required: true },
    max: { type: Number, required: true },
    display: { type: String, required: true },
  })

  const ticks = 12
  const filled = computed(() => Math.round((props.value / props.max) * ticks))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <p class="flex justify-between gap-3 font-mono text-micro text-muted uppercase">
      <span>{{ props.label }}</span>
      <span class="text-fg tabular-nums">{{ props.display }}</span>
    </p>
    <div class="flex gap-0.5" aria-hidden="true">
      <span
        v-for="tick in ticks"
        :key="tick"
        class="h-1.5 flex-1 rounded-full transition-colors duration-500"
        :class="tick <= filled ? 'bg-gold' : 'bg-fg/12'"
        :style="{ transitionDelay: `${tick * 25}ms` }" />
    </div>
  </div>
</template>
