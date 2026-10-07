<script setup lang="ts">
  import { brand } from '~/data/content'

  const text = {
    copyright: 'Há 16 anos fazendo chope com pioneirismo, experiência e qualidade.',
    moderation: 'Beba com moderação · Venda proibida para menores de 18 anos',
    credit: 'Desenvolvido por',
  }
  const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 border-t border-line bg-bg">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-[0.8125rem] text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col gap-3">
        <Logo full class="text-fg" />
        <p>{{ brand.full }} · {{ brand.city }}</p>
        <p>© {{ year }} {{ brand.full }}. {{ text.copyright }}</p>
      </div>

      <div class="flex flex-col md:items-end">
        <p class="font-mono text-micro text-malt uppercase">{{ text.moderation }}</p>
      </div>
    </div>

    <div class="border-t border-line">
      <p
        class="mx-auto max-w-7xl px-5 py-5 text-center text-[0.75rem] text-muted sm:px-8 md:text-left">
        {{ text.credit }}
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
