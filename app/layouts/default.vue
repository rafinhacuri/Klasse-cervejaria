<script setup lang="ts">
  const { t } = useI18n({ useScope: 'local' })
</script>

<template>
  <MotionConfig reduced-motion="user">
    <TooltipProvider>
      <a
        href="#main"
        class="sr-only z-70 rounded-full bg-fg px-4 py-2 text-sm text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {{ t('skip') }}
      </a>
      <Header />
      <Backdrop />
      <main id="main" class="relative z-10">
        <slot />
      </main>
      <Footer />
      <AgeGate />
    </TooltipProvider>
  </MotionConfig>
</template>

<i18n lang="json">
{
  "pt": { "skip": "Pular para o conteúdo" }
}
</i18n>
