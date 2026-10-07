<script setup lang="ts">
  import { TransitionPresets } from '@vueuse/core'

  import { whatsappLink } from '~/data/content'
  import type { Pace } from '~/utils/party'
  import { groupKegs, isPace, kegsFor, paces, partyLiters } from '~/utils/party'

  const { t } = useI18n({ useScope: 'local' })

  const guests = ref(40)
  const hours = ref(5)
  const pace = ref<Pace>('lively')

  const liters = computed(() => partyLiters(guests.value, hours.value, pace.value))
  const kegs = computed(() => groupKegs(kegsFor(liters.value)))
  const shown = useTransition(liters, { duration: 700, transition: TransitionPresets.easeOutCubic })

  const booking = computed(() =>
    whatsappLink(
      t('message', {
        guests: guests.value,
        hours: hours.value,
        liters: liters.value,
        kegs: kegs.value.map((keg) => `${keg.count} × ${keg.size} L`).join(' + '),
      }),
    ),
  )

  function choose(value: unknown): void {
    if (isPace(value)) pace.value = value
  }
</script>

<template>
  <div class="rounded-[2rem] border border-line bg-ink/60 p-6 shadow-float backdrop-blur-xl sm:p-8">
    <p class="font-mono text-micro text-gold uppercase">{{ t('title') }}</p>

    <div class="mt-8 flex flex-col gap-8">
      <RangeField
        v-model="guests"
        :label="t('guests')"
        :unit="t('people')"
        :min="10"
        :max="300"
        :step="5" />
      <RangeField v-model="hours" :label="t('hours')" :unit="t('hoursUnit')" :min="2" :max="12" />

      <div>
        <p class="font-mono text-micro text-muted uppercase" aria-hidden="true">{{ t('pace') }}</p>
        <ToggleGroupRoot
          :model-value="pace"
          type="single"
          :aria-label="t('pace')"
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
            <span class="relative">{{ t(`paces.${option}`) }}</span>
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </div>
    </div>

    <div class="mt-10 border-t border-line pt-8" aria-live="polite">
      <p class="font-mono text-micro text-muted uppercase">{{ t('result') }}</p>
      <p class="mt-2 font-display text-[5.5rem] leading-[0.85] font-black text-gold tabular-nums">
        {{ Math.round(shown) }}<span class="ml-2 text-[2rem] text-fg">{{ t('liters') }}</span>
      </p>
      <ul class="mt-5 flex flex-wrap gap-2">
        <li
          v-for="keg in kegs"
          :key="keg.size"
          class="flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem]">
          <Icon name="ph:cylinder" class="size-4 text-gold" />
          {{ t('keg', { count: keg.count, size: keg.size }) }}
        </li>
      </ul>
    </div>

    <a
      :href="booking"
      target="_blank"
      rel="noopener"
      class="mt-8 flex h-13 items-center justify-center gap-2 rounded-full bg-gold font-semibold text-ink transition-transform duration-150 active:scale-[0.98]">
      <Icon name="ph:whatsapp-logo" class="size-5" />
      {{ t('book') }}
    </a>
  </div>
</template>

<i18n lang="json">
{
  "pt": {
    "title": "Calculadora de chope",
    "guests": "Convidados",
    "people": "pessoas",
    "hours": "Duração",
    "hoursUnit": "horas",
    "pace": "Ritmo da festa",
    "paces": {
      "calm": "Tranquila",
      "lively": "Animada",
      "endless": "Sem hora"
    },
    "result": "Você vai precisar de",
    "liters": "litros",
    "keg": "{count} × barril de {size} L",
    "book": "Reservar chopeira",
    "message": "Olá, Klasse! Quero reservar chopeira para uma festa: {guests} convidados, {hours} horas, cerca de {liters} litros ({kegs})."
  }
}
</i18n>
