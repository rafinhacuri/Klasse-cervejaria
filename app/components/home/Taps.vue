<script setup lang="ts">
  import { beers } from '~/data/content'

  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')
  const active = ref('pilsen')

  useBackdrop(section, { beer: active, dim: 0.5 })
</script>

<template>
  <section id="chopes" ref="section" class="relative py-28 sm:py-40">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <p class="font-mono text-micro text-gold uppercase">{{ t('eyebrow') }}</p>
          <h2 class="mt-4 font-display text-display font-black uppercase">
            {{ t('title') }}
          </h2>
        </Reveal>
        <Reveal :delay="0.1" class="max-w-sm">
          <p class="text-lede text-pretty text-fg/80">{{ t('lede') }}</p>
        </Reveal>
      </div>

      <Reveal :delay="0.15" class="mt-14">
        <ul
          class="flex flex-col gap-1 rounded-[2rem] border border-line bg-ink/55 p-2 shadow-float backdrop-blur-xl sm:p-3">
          <TapRow
            v-for="beer in beers"
            :key="beer.id"
            :beer="beer"
            :active="active === beer.id"
            @focus="active = $event" />
        </ul>
      </Reveal>

      <p class="mt-6 font-mono text-micro text-muted uppercase">{{ t('note') }}</p>
    </div>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "eyebrow": "Feitos na nossa fábrica",
    "title": "Nossos chopes",
    "lede": "Passe por cada chope e veja a cor dele tomar o copo. Cada lote é acompanhado de perto pelo Mestre Gilson, do tanque ao barril.",
    "note": "Preço por litro no barril. Também trabalhamos com chope Brahma e Skol para eventos."
  }
}
</i18n>
