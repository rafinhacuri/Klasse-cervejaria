<script setup lang="ts">
  const props = defineProps({
    full: { type: Boolean, default: false },
  })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg viewBox="0 0 32 32" class="size-7 shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="var(--gold)" />
      <circle
        cx="16"
        cy="16"
        r="12.25"
        fill="none"
        stroke="var(--ink)"
        stroke-width="0.9"
        stroke-dasharray="1.6 1.6" />
      <path
        d="M11.5 9h3v5.6L19.4 9h3.5l-5.3 6.6L23 23h-3.6l-3.9-5.4-1 1.2V23h-3z"
        fill="var(--ink)" />
    </svg>
    <span
      class="font-display text-[1.375rem] leading-none font-extrabold tracking-[0.04em] uppercase">
      Klasse
      <span v-if="props.full" class="ml-1 font-semibold text-muted">Cervejaria</span>
    </span>
  </span>
</template>
