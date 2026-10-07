<script setup lang="ts">
  import { TransitionPresets } from '@vueuse/core'

  import type { Pace } from '~/utils/party'
  import { groupKegs, isPace, kegsFor, paces, partyLiters } from '~/utils/party'

  const text = {
    title: 'Calculadora de chope',
    guests: 'Convidados',
    people: 'pessoas',
    hours: 'Duração',
    hoursUnit: 'horas',
    pace: 'Ritmo da festa',
    paces: {
      calm: 'Tranquila',
      lively: 'Animada',
      endless: 'Sem hora',
    },
    result: 'Você vai precisar de',
    liters: 'litros',
    keg: 'barril de',
  }

  const guests = ref(40)
  const hours = ref(5)
  const pace = ref<Pace>('lively')

  const liters = computed(() => partyLiters(guests.value, hours.value, pace.value))
  const kegs = computed(() => groupKegs(kegsFor(liters.value)))
  const shown = useTransition(liters, { duration: 700, transition: TransitionPresets.easeOutCubic })

  function choose(value: unknown): void {
    if (isPace(value)) pace.value = value
  }
</script>

<template>
  <div class="rounded-[2rem] border border-line bg-ink/60 p-6 shadow-float backdrop-blur-xl sm:p-8">
    <p class="font-mono text-micro text-gold uppercase">{{ text.title }}</p>

    <div class="mt-8 flex flex-col gap-8">
      <RangeField
        v-model="guests"
        :label="text.guests"
        :unit="text.people"
        :min="10"
        :max="300"
        :step="5" />
      <RangeField v-model="hours" :label="text.hours" :unit="text.hoursUnit" :min="2" :max="12" />

      <div>
        <p class="font-mono text-micro text-muted uppercase" aria-hidden="true">{{ text.pace }}</p>
        <ToggleGroupRoot
          :model-value="pace"
          type="single"
          :aria-label="text.pace"
          class="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-fg/6 p-1"
          @update:model-value="choose">
          <ToggleGroupItem
            v-for="option in paces"
            :key="option"
            :value="option"
            class="relative h-11 rounded-xl px-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-fg data-[state=on]:text-ink">
            <Motion
              v-if="pace === option"
              as="span"
              layout-id="pace"
              class="absolute inset-0 rounded-xl bg-fg"
              :transition="{ type: 'spring', bounce: 0.15, duration: 0.45 }" />
            <span class="relative">{{ text.paces[option] }}</span>
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </div>
    </div>

    <div class="mt-10 border-t border-line pt-8" aria-live="polite">
      <p class="font-mono text-micro text-muted uppercase">{{ text.result }}</p>
      <p class="mt-2 font-display text-[5.5rem] leading-[0.85] font-black text-gold tabular-nums">
        {{ Math.round(shown) }}<span class="ml-2 text-[2rem] text-fg">{{ text.liters }}</span>
      </p>
      <ul class="mt-5 flex flex-wrap gap-2">
        <li
          v-for="keg in kegs"
          :key="keg.size"
          class="flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem]">
          <Icon name="ph:cylinder" class="size-4 text-gold" />
          {{ keg.count }} × {{ text.keg }} {{ keg.size }} L
        </li>
      </ul>
    </div>
  </div>
</template>
