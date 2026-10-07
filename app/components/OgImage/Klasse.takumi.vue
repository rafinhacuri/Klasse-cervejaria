<script setup lang="ts">
  const props = defineProps({
    title: { type: String, default: 'Chope fresco, tirado na hora.' },
    description: { type: String, default: 'Klasse Cervejaria' },
  })
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between bg-[#1a0d04] p-16 text-[#fff3dc]">
    <div class="flex items-center">
      <div class="flex h-6 w-6 rounded-full bg-[#f4b52a]" />
      <div class="ml-4 flex text-[30px] font-bold tracking-[0.12em] uppercase">
        Klasse Cervejaria
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex text-[104px] leading-none font-bold tracking-tight text-[#f4b52a]">
        {{ props.title }}
      </div>
      <div class="mt-6 flex max-w-225 text-[30px] leading-snug text-[#e8c48d]">
        {{ props.description }}
      </div>
    </div>
    <div class="flex text-[22px] tracking-widest text-[#e8c48d] uppercase">klasse.com.br</div>
  </div>
</template>
