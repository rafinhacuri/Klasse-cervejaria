<script setup lang="ts">
  const props = defineProps({
    liters: { type: Number, required: true },
    color: { type: String, required: true },
    foam: { type: String, required: true },
    level: { type: Number, default: 0 },
  })

  const id = useId()
  const height = computed(() => 56 + (props.liters / 50) * 58)
  const top = computed(() => 118 - height.value)
  const body = computed(() => ({ top: top.value + 12, bottom: 108 }))
  const surface = computed(
    () => body.value.bottom - props.level * (body.value.bottom - body.value.top - 4),
  )
  const ribs = computed(() => {
    const span = body.value.bottom - body.value.top
    return [body.value.top + span * 0.3, body.value.top + span * 0.72]
  })
</script>

<template>
  <svg viewBox="0 0 80 120" class="overflow-visible" aria-hidden="true">
    <defs>
      <linearGradient :id="`steel-${id}`" x1="0" x2="1">
        <stop offset="0" stop-color="#6d6f74" />
        <stop offset="0.22" stop-color="#e9eaec" />
        <stop offset="0.4" stop-color="#b6b8bc" />
        <stop offset="0.7" stop-color="#8b8d92" />
        <stop offset="1" stop-color="#4c4e52" />
      </linearGradient>
      <clipPath :id="`window-${id}`">
        <rect x="18" :y="body.top + 2" width="20" :height="body.bottom - body.top - 4" rx="3" />
      </clipPath>
    </defs>

    <rect x="12" :y="top" width="56" :height="height" rx="7" :fill="`url(#steel-${id})`" />
    <rect x="12" :y="top" width="56" height="12" rx="4" fill="#000" fill-opacity="0.18" />
    <rect
      x="22"
      :y="top + 3.5"
      width="12"
      height="4.5"
      rx="2.25"
      fill="#1a0d04"
      fill-opacity="0.75" />
    <rect
      x="46"
      :y="top + 3.5"
      width="12"
      height="4.5"
      rx="2.25"
      fill="#1a0d04"
      fill-opacity="0.75" />
    <rect x="34" :y="top - 4" width="12" height="5" rx="1.5" fill="var(--gold)" />
    <path
      v-for="rib in ribs"
      :key="rib"
      :d="`M12 ${rib}H68`"
      stroke="#000"
      stroke-opacity="0.22"
      stroke-width="2.6" />
    <path
      v-for="rib in ribs"
      :key="`light-${rib}`"
      :d="`M12 ${rib - 1.4}H68`"
      stroke="#fff"
      stroke-opacity="0.35"
      stroke-width="0.8" />

    <rect
      x="18"
      :y="body.top + 2"
      width="20"
      :height="body.bottom - body.top - 4"
      rx="3"
      fill="#1a0d04" />
    <g :clip-path="`url(#window-${id})`">
      <Motion
        as="rect"
        x="18"
        width="20"
        height="120"
        :fill="props.color"
        :initial="false"
        :animate="{ y: surface }"
        :transition="{ type: 'spring', bounce: 0.2, duration: 1.2 }" />
      <Motion
        as="rect"
        x="18"
        width="20"
        height="5"
        :fill="props.foam"
        :initial="false"
        :animate="{ y: surface - 4, opacity: props.level > 0.05 ? 1 : 0 }"
        :transition="{ type: 'spring', bounce: 0.2, duration: 1.2 }" />
    </g>
    <rect
      x="18"
      :y="body.top + 2"
      width="20"
      :height="body.bottom - body.top - 4"
      rx="3"
      fill="none"
      stroke="#fff"
      stroke-opacity="0.25" />
    <rect x="12" y="108" width="56" height="10" rx="4" fill="#000" fill-opacity="0.22" />
  </svg>
</template>
