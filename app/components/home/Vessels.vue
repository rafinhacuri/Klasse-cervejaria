<script setup lang="ts">
  import { vessels } from '~/data/content'

  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')
  const beer = ref('ipa')

  useBackdrop(section, { beer, dim: 0.55 })
</script>

<template>
  <section ref="section" class="relative py-28 sm:py-40" :aria-label="t('title')">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Reveal class="max-w-2xl">
          <p class="font-mono text-micro text-gold uppercase">{{ t('eyebrow') }}</p>
          <h2 class="mt-4 font-display text-display font-black uppercase">{{ t('title') }}</h2>
          <p class="mt-6 max-w-lg text-lede text-pretty text-fg/80">{{ t('lede') }}</p>
        </Reveal>
        <Reveal :delay="0.1">
          <BeerPicker v-model="beer" :label="t('picker')" />
        </Reveal>
      </div>

      <ul class="mt-14 grid gap-4 md:grid-cols-3">
        <Reveal v-for="(vessel, index) in vessels" :key="vessel.id" as="li" :delay="index * 0.08">
          <VesselCard :vessel="vessel" :beer="beer" />
        </Reveal>
      </ul>
    </div>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "eyebrow": "Barris de inox",
    "title": "A fábrica vai até você",
    "lede": "Barril gelado, lacrado e com data de envase. Escolha o chope, escolha o tamanho e a gente entrega com a chopeira pronta pra servir.",
    "picker": "Escolha o chope para ver no barril"
  }
}
</i18n>
