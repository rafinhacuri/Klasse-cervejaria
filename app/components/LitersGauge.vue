<script setup lang="ts">
  const props = defineProps({
    liters: { type: Number, required: true },
    total: { type: Number, required: true },
  })

  const text = {
    title: 'No barril',
    of: 'litros · 0 °C',
    label: 'litros no barril',
  }

  const shown = computed(() =>
    props.liters.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  )
  const level = computed(() => `${(props.liters / props.total) * 100}%`)
</script>

<template>
  <div class="flex items-end gap-4" role="status" :aria-label="`${shown} ${text.label}`">
    <div class="relative h-24 w-2 overflow-hidden rounded-full bg-fg/10">
      <div
        class="absolute inset-x-0 bottom-0 rounded-full bg-linear-to-t from-amber to-gold"
        :style="{ height: level }" />
    </div>
    <div class="font-mono text-micro text-muted uppercase">
      <p>{{ text.title }}</p>
      <p class="mt-1 font-display text-[3rem] leading-none font-extrabold text-fg tabular-nums">
        {{ shown }}<span class="ml-1 text-[1.5rem] text-muted">L</span>
      </p>
      <p class="mt-1">de {{ props.total }} {{ text.of }}</p>
    </div>
  </div>
</template>
