<script setup lang="ts">
  const props = defineProps({
    title: { type: String, default: 'Chope fresco, tirado na hora.' },
    description: { type: String, default: 'Klasse Cervejaria' },
  })

  const GLASS = 600
  const CENTER = GLASS / 2
  const RIM = 236

  function seeded(index: number): number {
    const value = Math.sin(index * 127.1 + 311.7) * 43_758.5453
    return value - Math.floor(value)
  }

  const foam = Array.from({ length: 46 }, (_, index) => {
    const angle = (index / 46) * Math.PI * 2 + seeded(index) * 0.12
    const size = 14 + seeded(index + 50) * 34
    const reach = RIM - size * 0.25 + seeded(index + 90) * 10
    return {
      x: CENTER + Math.cos(angle) * reach - size / 2,
      y: CENTER + Math.sin(angle) * reach - size / 2,
      size,
    }
  })

  const bubbles = Array.from({ length: 16 }, (_, index) => {
    const angle = seeded(index + 200) * Math.PI * 2
    const reach = seeded(index + 300) * (RIM - 50)
    const size = 5 + seeded(index + 400) * 14
    return {
      x: CENTER + Math.cos(angle) * reach - size / 2,
      y: CENTER + Math.sin(angle) * reach - size / 2,
      size,
    }
  })

  const facts = ['Rio de Janeiro', 'Barris de 20, 30 e 50 L', 'Chopes artesanais']

  function circle(item: { x: number; y: number; size: number }): Record<string, string> {
    return {
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: `${item.size}px`,
      height: `${item.size}px`,
    }
  }
</script>

<template>
  <div
    class="relative flex h-full w-full overflow-hidden text-[#fff3dc]"
    style="
      font-family: 'Instrument Sans';
      background-image: radial-gradient(circle at 80% 50%, #5a2c0a 0%, #1a0d04 62%);
    ">
    <div
      class="absolute flex rounded-full"
      :style="{
        right: '-170px',
        top: '15px',
        width: `${GLASS}px`,
        height: `${GLASS}px`,
        backgroundImage:
          'radial-gradient(circle at 38% 34%, #fffaf0 0%, #f1e1c0 60%, #d9bf8f 100%)',
      }">
      <div
        class="absolute flex rounded-full"
        :style="{
          left: `${CENTER - RIM}px`,
          top: `${CENTER - RIM}px`,
          width: `${RIM * 2}px`,
          height: `${RIM * 2}px`,
          backgroundImage:
            'radial-gradient(circle at 42% 40%, #f8c23a 0%, #e0951c 40%, #a85a0c 76%, #5e2c04 100%)',
        }" />
      <div
        v-for="(item, index) in foam"
        :key="`foam-${index}`"
        class="absolute flex rounded-full"
        :style="{
          ...circle(item),
          backgroundImage:
            'radial-gradient(circle at 35% 30%, #fffdf6 0%, #f3e4c6 70%, #e2cca0 100%)',
        }" />
      <div
        v-for="(item, index) in bubbles"
        :key="`bubble-${index}`"
        class="absolute flex rounded-full"
        :style="{ ...circle(item), border: '2px solid rgba(255, 243, 220, 0.75)' }" />
    </div>

    <div class="relative flex h-full w-190 flex-col justify-between px-16 py-14">
      <div class="flex items-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4b52a]">
          <div
            class="flex text-[36px] font-black text-[#1a0d04]"
            style="font-family: 'Big Shoulders'">
            K
          </div>
        </div>
        <div
          class="ml-5 flex text-[38px] font-extrabold tracking-wider uppercase"
          style="font-family: 'Big Shoulders'">
          Klasse
        </div>
        <div
          class="ml-3 flex text-[38px] font-semibold tracking-wider text-[#e8c48d] uppercase"
          style="font-family: 'Big Shoulders'">
          Cervejaria
        </div>
      </div>

      <div class="flex flex-col">
        <div
          class="flex text-[96px] leading-[0.92] font-black uppercase"
          style="font-family: 'Big Shoulders'">
          {{ props.title }}
        </div>
        <div class="mt-6 flex text-[26px] leading-snug text-[#e8c48d]">
          {{ props.description }}
        </div>
      </div>

      <div class="flex">
        <div
          v-for="fact in facts"
          :key="fact"
          class="mr-2 flex shrink-0 rounded-full px-4 py-2 text-[17px] whitespace-nowrap"
          style="border: 1px solid rgba(255, 243, 220, 0.3)">
          {{ fact }}
        </div>
      </div>
    </div>
  </div>
</template>
