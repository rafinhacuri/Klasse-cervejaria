<script setup lang="ts">
  const text = {
    title: 'Você tem 18 anos ou mais?',
    body: 'Aqui só entra quem já pode brindar. Confirme sua idade para ver os chopes.',
    yes: 'Sim, tenho 18+',
    no: 'Ainda não',
    refused: {
      title: 'Volte daqui a pouco.',
      body: 'Quando fizer 18, a primeira rodada é por nossa conta. Até lá, a gente guarda o seu lugar no balcão.',
    },
    law: 'Venda proibida para menores de 18 anos',
  }
  const adult = useLocalStorage('klasse:adult', false)
  const refused = ref(false)
  const ready = ref(false)
  const open = computed(() => ready.value && !adult.value)

  function confirm(): void {
    adult.value = true
  }

  onNuxtReady(() => {
    ready.value = true
  })
</script>

<template>
  <AlertDialogRoot :open="open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="scrim fixed inset-0 z-80 bg-ink/50 backdrop-blur-md" />
      <AlertDialogContent
        class="sheet fixed top-1/2 left-1/2 z-90 w-[calc(100%-2rem)] max-w-md -translate-1/2 rounded-[2rem] border border-line bg-surface/90 p-8 text-center shadow-float backdrop-blur-xl sm:p-10">
        <Logo class="justify-center" />
        <AlertDialogTitle
          class="mt-8 font-display text-headline font-extrabold text-balance uppercase">
          {{ refused ? text.refused.title : text.title }}
        </AlertDialogTitle>
        <AlertDialogDescription class="mx-auto mt-4 max-w-xs text-pretty text-muted">
          {{ refused ? text.refused.body : text.body }}
        </AlertDialogDescription>

        <div v-if="!refused" class="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <AlertDialogAction
            class="h-12 flex-1 rounded-full bg-gold px-6 font-semibold text-ink transition-transform duration-150 active:scale-[0.97]"
            @click="confirm">
            {{ text.yes }}
          </AlertDialogAction>
          <AlertDialogCancel
            class="h-12 flex-1 rounded-full border border-line px-6 font-medium transition-colors hover:bg-fg/5 active:scale-[0.97]"
            @click.prevent="refused = true">
            {{ text.no }}
          </AlertDialogCancel>
        </div>

        <p class="mt-8 font-mono text-micro text-muted uppercase">{{ text.law }}</p>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
