<script setup lang="ts">
  import type { Beer } from '~/data/content'
  import { price } from '~/data/content'

  const props = defineProps({
    beer: { type: Object as PropType<Beer>, required: true },
    active: { type: Boolean, default: false },
  })

  const emit = defineEmits<{ focus: [id: string] }>()

  const { t } = useI18n({ useScope: 'local' })
  const row = useTemplateRef<HTMLElement>('row')

  useIntersectionObserver(
    row,
    ([entry]) => {
      if (entry?.isIntersecting) emit('focus', props.beer.id)
    },
    { rootMargin: '-48% 0px -48% 0px' },
  )
</script>

<template>
  <li
    ref="row"
    tabindex="0"
    class="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-x-5 gap-y-4 rounded-3xl px-4 py-6 transition-colors duration-500 outline-none sm:px-6 lg:grid-cols-[3.5rem_1.1fr_1.4fr_1fr_auto] lg:gap-x-8"
    :class="props.active ? 'bg-fg/[0.06]' : ''"
    @pointerenter="emit('focus', props.beer.id)"
    @focus="emit('focus', props.beer.id)">
    <BeerGlass
      class="h-14 w-10 text-fg lg:h-16 lg:w-11"
      :color="props.beer.color"
      :foam="props.beer.foam"
      :level="props.active ? 1 : 0.62" />

    <div>
      <h3 class="font-display text-title leading-none font-extrabold uppercase">
        {{ props.beer.name }}
      </h3>
      <p class="mt-1.5 font-mono text-micro text-muted uppercase">{{ props.beer.style }}</p>
    </div>

    <p class="text-right lg:order-last">
      <span class="block font-display text-[1.75rem] leading-none font-bold tabular-nums">
        {{ price(props.beer.price) }}
      </span>
      <span class="font-mono text-micro text-muted uppercase">{{ t('liter') }}</span>
    </p>

    <p class="col-span-3 text-[0.9375rem] text-pretty text-muted lg:col-span-1">
      {{ props.beer.notes }}
    </p>

    <div class="col-span-3 grid grid-cols-2 gap-4 lg:col-span-1">
      <Meter
        :label="t('abv')"
        :value="props.beer.abv"
        :max="8"
        :display="`${props.beer.abv.toLocaleString('pt-BR')}%`" />
      <Meter
        :label="t('ibu')"
        :value="props.beer.ibu"
        :max="70"
        :display="String(props.beer.ibu)" />
    </div>
  </li>
</template>

<i18n lang="json">
{
  "pt": {
    "liter": "o litro",
    "abv": "Álcool",
    "ibu": "Amargor"
  }
}
</i18n>
