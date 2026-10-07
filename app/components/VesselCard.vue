<script setup lang="ts">
  import type { Vessel } from '~/data/content'
  import { beerById, price, whatsappLink } from '~/data/content'

  const props = defineProps({
    vessel: { type: Object as PropType<Vessel>, required: true },
    beer: { type: String, default: 'pilsen' },
  })

  const { t } = useI18n({ useScope: 'local' })
  const card = useTemplateRef<HTMLElement>('card')
  const hovered = useElementHover(card)
  const seen = ref(false)

  useIntersectionObserver(
    card,
    ([entry]) => {
      if (entry?.isIntersecting) seen.value = true
    },
    { threshold: 0.6 },
  )

  const tone = computed(() => beerById(props.beer))
  const level = computed(() => {
    if (hovered.value) return 0.96
    return seen.value ? 0.72 : 0
  })
  const order = computed(() => whatsappLink(t('message', { liters: props.vessel.liters })))
</script>

<template>
  <article
    ref="card"
    class="group flex h-full flex-col rounded-[2rem] border border-line bg-ink/55 p-6 shadow-float backdrop-blur-xl transition-[transform,border-color] duration-500 ease-(--ease-out-quint) hover:-translate-y-1 hover:border-gold/40 sm:p-8">
    <div class="flex h-56 items-end justify-center">
      <VesselArt
        class="h-full text-fg"
        :liters="props.vessel.liters"
        :color="tone.color"
        :foam="tone.foam"
        :level="level" />
    </div>

    <div class="mt-8 flex items-baseline justify-between gap-4">
      <h3 class="font-display text-title font-extrabold uppercase">
        {{ props.vessel.name }}
        <span class="text-gold">{{ props.vessel.liters }} L</span>
      </h3>
      <p class="text-right font-mono text-micro text-muted uppercase">
        {{ t('from') }}
        <span class="block font-display text-[1.5rem] leading-none font-bold text-fg normal-case">
          {{ price(props.vessel.price) }}
        </span>
      </p>
    </div>

    <p class="mt-2 font-mono text-micro text-malt uppercase">{{ props.vessel.serves }}</p>
    <p class="mt-3 mb-8 text-pretty text-muted">{{ props.vessel.notes }}</p>

    <a
      :href="order"
      target="_blank"
      rel="noopener"
      class="mt-auto inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-line px-5 pt-0 text-[0.875rem] font-medium transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
      {{ t('order') }}
      <Icon name="ph:arrow-up-right" class="size-4" />
    </a>
  </article>
</template>

<i18n lang="json">
{
  "pt": {
    "from": "a partir de",
    "order": "Encomendar",
    "message": "Olá, Klasse! Quero encomendar um barril de {liters} L."
  }
}
</i18n>
