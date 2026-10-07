<script setup lang="ts">
  import { whatsappLink } from '~/data/content'

  const { t } = useI18n({ useScope: 'local' })
  const { y } = useWindowScroll()
  const open = ref(false)
  const active = ref<string | null>(null)

  const links = computed(() => [
    { id: 'chopes', label: t('beers') },
    { id: 'barril', label: t('keg') },
    { id: 'eventos', label: t('events') },
    { id: 'visite', label: t('visit') },
  ])

  const scrolled = computed(() => y.value > 8)
  const order = computed(() => whatsappLink(t('message')))

  function spy(): void {
    const middle = globalThis.innerHeight * 0.4
    active.value = null
    for (const link of links.value) {
      const rect = document.querySelector(`#${link.id}`)?.getBoundingClientRect()
      if (rect && rect.top <= middle && rect.bottom > middle) active.value = link.id
    }
  }

  function close(): void {
    open.value = false
  }

  useEventListener('scroll', useThrottleFn(spy, 120, true), { passive: true })
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50">
    <div
      class="border-b transition-[background-color,border-color,backdrop-filter] duration-500"
      :class="scrolled ? 'border-line glass' : 'border-transparent'">
      <nav
        class="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8"
        :aria-label="t('primary')">
        <a href="#top" class="flex items-center" :aria-label="t('home')">
          <Logo />
        </a>

        <div class="hidden items-center gap-4 md:flex">
          <ul class="flex items-center">
            <li v-for="link in links" :key="link.id">
              <a
                :href="`#${link.id}`"
                class="relative flex h-8 items-center rounded-full px-3 text-[0.8125rem] font-medium transition-colors duration-200"
                :class="active === link.id ? 'text-fg' : 'text-muted hover:text-fg'"
                :aria-current="active === link.id ? 'location' : undefined">
                <Motion
                  v-if="active === link.id"
                  layout-id="nav-active"
                  class="absolute inset-0 rounded-full bg-fg/10"
                  :transition="{ type: 'spring', bounce: 0.15, duration: 0.45 }" />
                <span class="relative">{{ link.label }}</span>
              </a>
            </li>
          </ul>

          <a
            :href="order"
            target="_blank"
            rel="noopener"
            class="inline-flex h-9 items-center gap-2 rounded-full bg-gold px-4 text-[0.8125rem] font-semibold text-ink transition-transform duration-150 active:scale-[0.97]">
            <Icon name="ph:whatsapp-logo" class="size-4" />
            {{ t('order') }}
          </a>
        </div>

        <DialogRoot v-model:open="open">
          <DialogTrigger
            class="-mr-2 flex size-11 items-center justify-center md:hidden"
            :aria-label="t('menu')">
            <span class="relative block h-3 w-4.5">
              <span class="absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-fg" />
              <span class="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-fg" />
            </span>
          </DialogTrigger>

          <DialogPortal>
            <DialogContent
              class="sheet fixed inset-0 z-60 flex flex-col glass px-5 pt-2 pb-10 text-fg md:hidden"
              :aria-describedby="undefined">
              <div class="flex h-10 items-center justify-between">
                <DialogTitle as="div">
                  <Logo />
                </DialogTitle>
                <DialogClose
                  class="-mr-2 flex size-11 items-center justify-center"
                  :aria-label="t('close')">
                  <Icon name="ph:x" class="size-5" />
                </DialogClose>
              </div>

              <ul class="mt-12 flex flex-col">
                <li v-for="(link, index) in links" :key="link.id">
                  <Motion
                    :initial="{ opacity: 0, y: -12, filter: 'blur(6px)' }"
                    :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
                    :transition="{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.05 * index }">
                    <a
                      :href="`#${link.id}`"
                      class="block py-2 font-display text-[3rem] leading-none font-extrabold uppercase"
                      :class="active === link.id ? 'text-gold' : 'text-fg'"
                      @click="close">
                      {{ link.label }}
                    </a>
                  </Motion>
                </li>
              </ul>

              <Motion
                class="mt-auto"
                :initial="{ opacity: 0, y: 12 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.25, duration: 0.4 }">
                <a
                  :href="order"
                  target="_blank"
                  rel="noopener"
                  class="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink">
                  <Icon name="ph:whatsapp-logo" class="size-5" />
                  {{ t('order') }}
                </a>
              </Motion>
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
      </nav>
    </div>
  </header>
</template>

<i18n lang="json">
{
  "pt": {
    "primary": "Principal",
    "home": "Klasse Cervejaria, voltar ao topo",
    "beers": "Chopes",
    "keg": "Barril",
    "events": "Eventos",
    "visit": "Onde estamos",
    "order": "Pedir agora",
    "message": "Olá, Klasse! Quero fazer um pedido.",
    "menu": "Abrir menu",
    "close": "Fechar menu"
  }
}
</i18n>
