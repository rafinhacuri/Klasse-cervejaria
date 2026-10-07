<script setup lang="ts">
  import { useScroll, useTransform } from 'motion-v'
  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')

  useBackdrop(section, { beer: 'pilsen', dim: 0 })

  const { scrollY } = useScroll()
  const progress = useTransform(scrollY, (y) => y / (section.value?.offsetHeight || 1))
  const lift = useTransform(progress, [0, 1], [0, -160])
  const fade = useTransform(progress, [0, 0.7], [1, 0])

  const letters = [...'KLASSE']

  function float(index: number): Record<string, string> {
    return {
      '--tilt': `${index % 2 ? -1.6 : 1.4}deg`,
      '--bob-delay': `${-index * 0.73}s`,
      '--bob-duration': `${4.6 + (index % 3) * 0.7}s`,
    }
  }
</script>

<template>
  <section id="top" ref="section" class="relative min-h-dvh overflow-hidden">
    <Motion
      class="relative mx-auto flex min-h-dvh max-w-7xl flex-col justify-between px-5 pt-24 pb-10 sm:px-8 md:pt-28"
      :style="{ y: lift, opacity: fade }">
      <Motion
        as="p"
        class="flex items-center gap-3 font-mono text-micro text-fg/80 uppercase"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.1 }">
        <span class="h-px w-8 bg-fg/50" />
        {{ t('eyebrow') }}
      </Motion>

      <div>
        <h1 :aria-label="t('title')" class="float-shadow">
          <span
            class="flex justify-between font-display text-giant font-black text-fg uppercase"
            aria-hidden="true">
            <Motion
              v-for="(letter, index) in letters"
              :key="index"
              as="span"
              class="inline-block"
              :initial="{ y: '45%', opacity: 0, filter: 'blur(18px)', scale: 0.92 }"
              :animate="{ y: '0%', opacity: 1, filter: 'blur(0px)', scale: 1 }"
              :transition="{
                type: 'spring',
                bounce: 0.2,
                duration: 1.6,
                delay: 0.25 + index * 0.08,
              }">
              <span class="bob inline-block" :style="float(index)">{{ letter }}</span>
            </Motion>
          </span>
          <Motion
            as="span"
            class="mt-3 block text-right font-display text-[clamp(1.25rem,3vw,2.5rem)] font-bold text-fg/90 uppercase sm:mt-5"
            aria-hidden="true"
            :initial="{ opacity: 0, letterSpacing: '1.1em' }"
            :animate="{ opacity: 1, letterSpacing: '0.6em' }"
            :transition="{ duration: 1.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }">
            {{ t('subtitle') }}
          </Motion>
        </h1>
      </div>

      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Motion
          as="p"
          class="max-w-md text-lede text-pretty text-fg/90 float-shadow"
          :initial="{ opacity: 0, y: 16, filter: 'blur(8px)' }"
          :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
          :transition="{ type: 'spring', bounce: 0, duration: 1, delay: 1.1 }">
          {{ t('lede') }}
        </Motion>

        <Motion
          class="flex flex-wrap items-center gap-3"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ type: 'spring', bounce: 0, duration: 0.9, delay: 1.25 }">
          <a
            href="#chopes"
            class="group inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-[0.9375rem] font-semibold text-ink shadow-float transition-transform duration-150 active:scale-[0.97]">
            {{ t('menu') }}
            <Icon
              name="ph:arrow-down"
              class="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
          <a
            href="#barril"
            class="inline-flex h-12 items-center gap-2 rounded-full border border-fg/30 px-5 text-[0.9375rem] font-medium text-fg backdrop-blur-sm transition-colors hover:bg-fg/10 active:scale-[0.97]">
            {{ t('keg') }}
          </a>
        </Motion>
      </div>
    </Motion>

    <Motion
      as="p"
      class="pointer-events-none absolute top-1/2 right-5 hidden origin-right translate-x-1/2 rotate-90 font-mono text-micro text-fg/60 uppercase sm:right-8 lg:block"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 2.4, duration: 0.8 }">
      {{ t('hint') }}
    </Motion>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "eyebrow": "Cervejaria artesanal · Rio de Janeiro",
    "title": "Klasse Cervejaria",
    "subtitle": "Cervejaria",
    "lede": "Há 16 anos fazendo chope com pioneirismo, experiência e qualidade. Direto da nossa fábrica para o seu barril, gelado entre 0 e 2 °C.",
    "menu": "Conhecer os chopes",
    "keg": "Ver o barril",
    "hint": "Passe o mouse no chope"
  }
}
</i18n>
