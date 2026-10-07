<script setup lang="ts">
  const props = defineProps({
    color: { type: String, required: true },
    foam: { type: String, required: true },
    level: { type: Number, default: 1 },
  })

  const id = useId()
  const top = computed(() => 58 - props.level * 46)
</script>

<template>
  <svg viewBox="0 0 40 64" class="overflow-visible" aria-hidden="true">
    <defs>
      <clipPath :id="`glass-${id}`">
        <path d="M8 4h24c0 14-2 24-5 32-2 6-3 12-3 20h-8c0-8-1-14-3-20C10 28 8 18 8 4z" />
      </clipPath>
      <linearGradient :id="`shine-${id}`" x1="0" x2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.35" />
        <stop offset="0.3" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g :clip-path="`url(#glass-${id})`">
      <Motion
        as="rect"
        x="0"
        width="40"
        height="64"
        :fill="props.color"
        :initial="false"
        :animate="{ y: top }"
        :transition="{ type: 'spring', bounce: 0.25, duration: 0.8 }" />
      <Motion
        as="rect"
        x="0"
        width="40"
        height="6"
        rx="2"
        :fill="props.foam"
        :initial="false"
        :animate="{ y: top - 4, opacity: props.level > 0.05 ? 1 : 0 }"
        :transition="{ type: 'spring', bounce: 0.25, duration: 0.8 }" />
      <rect x="0" y="0" width="40" height="64" :fill="`url(#shine-${id})`" />
    </g>
    <path
      d="M8 4h24c0 14-2 24-5 32-2 6-3 12-3 20h-8c0-8-1-14-3-20C10 28 8 18 8 4z"
      fill="none"
      stroke="currentColor"
      stroke-opacity="0.5"
      stroke-width="1.2" />
    <path
      d="M12 60h16"
      stroke="currentColor"
      stroke-opacity="0.5"
      stroke-width="1.6"
      stroke-linecap="round" />
  </svg>
</template>
