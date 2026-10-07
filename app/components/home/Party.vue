<script setup lang="ts">
  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')

  useBackdrop(section, { beer: 'red', dim: 0.6 })

  const perks = [
    { id: 'tap', icon: 'ph:beer-stein' },
    { id: 'install', icon: 'ph:wrench' },
    { id: 'ice', icon: 'ph:snowflake' },
    { id: 'pickup', icon: 'ph:truck' },
  ] as const
</script>

<template>
  <section id="eventos" ref="section" class="relative py-28 sm:py-40">
    <div class="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      <div>
        <Reveal>
          <p class="font-mono text-micro text-gold uppercase">{{ t('eyebrow') }}</p>
          <h2 class="mt-4 font-display text-display font-black text-balance uppercase">
            {{ t('title') }}
          </h2>
          <p class="mt-6 max-w-lg text-lede text-pretty text-fg/80">{{ t('lede') }}</p>
        </Reveal>

        <ul class="mt-12 grid gap-3 sm:grid-cols-2">
          <Reveal
            v-for="(perk, index) in perks"
            :key="perk.id"
            as="li"
            :delay="0.05 * index"
            class="flex gap-4 rounded-3xl border border-line bg-ink/40 p-5 backdrop-blur-md">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Icon :name="perk.icon" class="size-5" />
            </span>
            <div>
              <h3 class="font-semibold">{{ t(`perks.${perk.id}.title`) }}</h3>
              <p class="mt-1 text-[0.875rem] text-pretty text-muted">
                {{ t(`perks.${perk.id}.body`) }}
              </p>
            </div>
          </Reveal>
        </ul>
      </div>

      <Reveal :delay="0.1" class="lg:sticky lg:top-24 lg:self-start">
        <PartyCalculator />
      </Reveal>
    </div>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "eyebrow": "Eventos",
    "title": "Festa boa tem chopeira",
    "lede": "Aniversário, casamento ou churrasco de domingo: a gente leva o chope, monta a chopeira e busca tudo no dia seguinte. Você só cuida dos convidados.",
    "perks": {
      "tap": {
        "title": "Chopeira elétrica",
        "body": "Gela na hora, sem gelo dentro do chope. Uma ou duas torneiras."
      },
      "install": {
        "title": "Instalação inclusa",
        "body": "Nossa equipe monta, testa a pressão e tira o primeiro copo."
      },
      "ice": {
        "title": "Barril sempre gelado",
        "body": "Barris de 20, 30 e 50 litros saem da câmara fria direto pra sua festa."
      },
      "pickup": {
        "title": "Retirada no dia seguinte",
        "body": "Sobrou chope? Fica com você. A gente só busca o equipamento."
      }
    }
  }
}
</i18n>
