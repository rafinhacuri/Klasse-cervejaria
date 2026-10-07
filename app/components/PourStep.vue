<script setup lang="ts">
  const props = defineProps({
    index: { type: Number, required: true },
    total: { type: Number, required: true },
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  })
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh max-w-7xl items-start px-5 pt-20 sm:px-8 lg:items-center lg:pt-0">
    <Reveal
      class="w-full max-w-md rounded-[1.75rem] border border-line glass p-6 sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      :amount="0.5"
      :once="false">
      <p class="flex items-center gap-3 font-mono text-micro text-gold uppercase">
        <span class="tabular-nums">{{ props.index }} / {{ props.total }}</span>
        <span class="h-px w-6 bg-gold/50" />
        {{ props.eyebrow }}
      </p>
      <h2 class="mt-4 font-display text-headline font-extrabold text-balance uppercase">
        {{ props.title }}
      </h2>
      <p class="mt-4 text-lede text-pretty text-muted">{{ props.body }}</p>
    </Reveal>
  </div>
</template>
