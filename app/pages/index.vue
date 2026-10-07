<script setup lang="ts">
  const { t } = useI18n({ useScope: 'local' })

  useHead({ title: t('title') })
  useSeoMeta({ description: t('description') })
  defineOgImage('Klasse.takumi', { title: t('og'), description: t('ogDescription') })
</script>

<template>
  <div>
    <HomeHero />
    <HomeTaps />
    <HomePour />
    <HomeVessels />
    <HomeParty />
    <HomeVisit />
  </div>
</template>

<i18n lang="json">
{
  "pt": {
    "title": "Chope fresco, tirado na hora",
    "og": "Chope fresco, tirado na hora.",
    "ogDescription": "Há 16 anos fazendo chope artesanal, direto da nossa fábrica para o seu barril.",
    "description": "Klasse Cervejaria: há 16 anos fazendo chope artesanal. Barris de inox de 20, 30 e 50 litros, gelados e lacrados, com chopeira para eventos."
  }
}
</i18n>
