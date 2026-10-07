<script setup lang="ts">
  import { contact, hours, whatsappLink } from '~/data/content'

  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')

  useBackdrop(section, { beer: 'weiss', dim: 0.15 })

  const letters = [...'SAÚDE!']

  function float(index: number): Record<string, string> {
    return {
      '--tilt': `${index % 2 ? 1.8 : -1.4}deg`,
      '--bob-delay': `${-index * 0.61}s`,
      '--bob-duration': `${5 + (index % 3) * 0.6}s`,
    }
  }
</script>

<template>
  <section id="visite" ref="section" class="relative overflow-x-clip pt-28 sm:pt-40">
    <div class="mx-auto grid max-w-7xl items-start gap-6 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
      <Reveal
        class="rounded-[2rem] border border-line bg-ink/60 p-6 shadow-float backdrop-blur-xl sm:p-10">
        <p class="font-mono text-micro text-gold uppercase">{{ t('eyebrow') }}</p>
        <h2 class="mt-4 font-display text-headline font-black text-balance uppercase">
          {{ t('title') }}
        </h2>
        <p class="mt-5 max-w-md text-lede text-pretty text-muted">{{ t('lede') }}</p>

        <address class="mt-8 not-italic">
          <p class="font-semibold">{{ contact.address }}</p>
          <p class="text-muted">{{ contact.district }}</p>
        </address>

        <div class="mt-8 flex flex-wrap gap-3">
          <a
            :href="whatsappLink(t('message'))"
            target="_blank"
            rel="noopener"
            class="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-ink transition-transform duration-150 active:scale-[0.97]">
            <Icon name="ph:whatsapp-logo" class="size-5" />
            {{ contact.phone }}
          </a>
          <a
            :href="contact.maps"
            target="_blank"
            rel="noopener"
            class="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 font-medium transition-colors hover:bg-fg/5 active:scale-[0.97]">
            <Icon name="ph:map-pin" class="size-5" />
            {{ t('directions') }}
          </a>
        </div>
      </Reveal>

      <Reveal
        :delay="0.1"
        class="rounded-[2rem] border border-line bg-ink/60 p-6 shadow-float backdrop-blur-xl sm:p-10">
        <p class="flex items-center gap-2 font-mono text-micro text-gold uppercase">
          <span class="live-dot relative size-1.5 rounded-full bg-[#30d158]" />
          {{ t('hours') }}
        </p>
        <dl class="mt-6 divide-y divide-line">
          <div
            v-for="slot in hours"
            :key="slot.days"
            class="flex items-baseline justify-between gap-6 py-4">
            <dt class="text-muted">{{ slot.days }}</dt>
            <dd class="text-right font-display text-[1.375rem] leading-none font-bold">
              {{ slot.time }}
            </dd>
          </div>
        </dl>
      </Reveal>
    </div>

    <p
      class="mt-[0.4em] flex justify-between px-5 pb-[0.12em] font-display text-giant font-black text-fg uppercase float-shadow sm:px-8"
      aria-hidden="true">
      <Motion
        v-for="(letter, index) in letters"
        :key="index"
        as="span"
        class="inline-block"
        :initial="{ y: '50%', opacity: 0, filter: 'blur(16px)' }"
        :while-in-view="{ y: '0%', opacity: 1, filter: 'blur(0px)' }"
        :in-view-options="{ once: true, amount: 0.2 }"
        :transition="{ type: 'spring', bounce: 0.2, duration: 1.6, delay: index * 0.07 }">
        <span class="bob inline-block" :style="float(index)">{{ letter }}</span>
      </Motion>
    </p>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "eyebrow": "Fale com a gente",
    "title": "Peça seu barril",
    "lede": "Encomende pelo WhatsApp ou passe na fábrica para buscar. Para eventos, reserve com antecedência que a gente separa o barril e a chopeira.",
    "directions": "Como chegar",
    "hours": "Atendimento",
    "message": "Olá, Klasse! Quero saber mais sobre os barris de chope."
  }
}
</i18n>
