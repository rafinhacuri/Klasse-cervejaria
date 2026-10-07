<script setup lang="ts">
  const { t } = useI18n({ useScope: 'local' })
  const section = useTemplateRef<HTMLElement>('section')
  const beer = ref('pilsen')

  const { top, height } = useElementBounding(section)
  const { height: viewport } = useWindowSize()

  const progress = computed(() => clamp(-top.value / Math.max(height.value - viewport.value, 1)))
  const liters = computed(() => pouredLiters(progress.value))

  const steps = ['cold', 'pour', 'head', 'seal'] as const

  useBackdrop(section, { beer, dim: 1 })
</script>

<template>
  <section id="barril" ref="section" class="relative bg-bg" :aria-label="t('label')">
    <div
      class="pointer-events-none absolute inset-x-0 bottom-full -z-10 h-[60dvh] bg-linear-to-b from-transparent to-bg" />
    <div
      class="pointer-events-none absolute inset-x-0 top-full -z-10 h-[60dvh] bg-linear-to-b from-bg to-transparent" />
    <div class="sticky top-0 h-dvh overflow-hidden">
      <KegStage :progress="progress" :beer="beer" class="absolute inset-0" />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg to-transparent" />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-bg to-transparent" />

      <div
        class="absolute inset-x-0 bottom-6 mx-auto flex max-w-7xl justify-center px-5 sm:px-8 lg:bottom-10 lg:justify-end">
        <div class="flex flex-col items-end gap-5">
          <LitersGauge class="hidden lg:flex" :liters="liters" :total="KEG_LITERS" />
          <BeerPicker
            v-model="beer"
            :label="t('picker')"
            :only="['pilsen', 'ipa', 'red', 'stout']" />
        </div>
      </div>
    </div>

    <div class="relative -mt-[100dvh]">
      <PourStep
        v-for="(step, index) in steps"
        :key="step"
        :index="index + 1"
        :total="steps.length"
        :title="t(`${step}.title`)"
        :body="t(`${step}.body`)"
        :eyebrow="t(`${step}.eyebrow`)" />
      <div class="h-[40dvh]" />
    </div>
  </section>
</template>

<i18n lang="json">
{
  "pt": {
    "label": "Como enchemos um barril de 20 litros",
    "picker": "Escolha o chope do barril",
    "cold": {
      "eyebrow": "Fábrica",
      "title": "Do tanque direto pro barril.",
      "body": "O chope sai dos nossos tanques de maturação, gelado e sem filtro de atalho. O barril de inox é lavado, sanitizado e pressurizado antes de receber uma gota."
    },
    "pour": {
      "eyebrow": "Enchimento",
      "title": "Pela válvula, sem pegar ar.",
      "body": "O engate encaixa na válvula e o chope desce pela linha até encher os 20 litros. Fechado do tanque ao barril, sem oxigênio no caminho."
    },
    "head": {
      "eyebrow": "Frio",
      "title": "Inox suando é chope no ponto.",
      "body": "O barril sai da câmara fria entre 0 e 2 °C. Quando o inox embaça até a borda, está cheio e gelado do jeito certo."
    },
    "seal": {
      "eyebrow": "Lacre",
      "title": "Lacrou, levou.",
      "body": "Lacre na válvula e data de envase no barril. É só ligar na chopeira e servir. Na festa, a gente leva, instala e busca."
    }
  }
}
</i18n>
