<script setup lang="ts">
  import { brand, contact, socials } from '~/data/content'

  const { t } = useI18n({ useScope: 'local' })
  const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 border-t border-line bg-bg">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-[0.8125rem] text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col gap-3">
        <Logo full class="text-fg" />
        <p>{{ contact.address }} · {{ contact.district }}</p>
        <p>{{ t('copyright', { year, name: brand.full }) }}</p>
      </div>

      <div class="flex flex-col gap-4 md:items-end">
        <ul class="-ml-3 flex items-center gap-1 md:-mr-3 md:ml-0">
          <li v-for="social in socials" :key="social.name">
            <TooltipRoot :delay-duration="300">
              <TooltipTrigger as-child>
                <a
                  :href="social.href"
                  :target="social.href.startsWith('http') ? '_blank' : undefined"
                  rel="noopener"
                  :aria-label="social.name"
                  class="flex size-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-surface-2 hover:text-fg">
                  <Icon :name="social.icon" class="size-5" />
                </a>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  side="top"
                  :side-offset="6"
                  class="z-60 rounded-lg bg-fg px-2.5 py-1 font-mono text-micro text-ink shadow-float">
                  {{ social.handle }}
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </li>
        </ul>
        <p class="font-mono text-micro text-malt uppercase">{{ t('moderation') }}</p>
      </div>
    </div>

    <div class="border-t border-line">
      <p
        class="mx-auto max-w-7xl px-5 py-5 text-center text-[0.75rem] text-muted sm:px-8 md:text-left">
        {{ t('credit') }}
        <a
          href="https://curi.dev.br"
          target="_blank"
          rel="noopener"
          class="font-medium text-fg underline decoration-line underline-offset-4 transition-colors hover:text-gold hover:decoration-gold">
          Rafael Curi
        </a>
      </p>
    </div>
  </footer>
</template>

<i18n lang="json">
{
  "pt": {
    "copyright": "© {year} {name}. Há 16 anos fazendo chope com pioneirismo, experiência e qualidade.",
    "moderation": "Beba com moderação · Venda proibida para menores de 18 anos",
    "credit": "Desenvolvido por"
  }
}
</i18n>
