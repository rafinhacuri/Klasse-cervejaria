import process from 'node:process'

import tailwindcss from '@tailwindcss/vite'

const { DEV_URL, DEV_KEY, DEV_CERT } = process.env

export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-security',
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/fonts',
    '@nuxt/icon',
    'reka-ui/nuxt',
    'motion-v/nuxt',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      templateParams: { separator: '•' },
      meta: [{ name: 'theme-color', content: '#1a0d04' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  css: ['~/assets/main.css'],
  site: {
    url: 'https://klasse.com.br/',
    name: 'Klasse Cervejaria',
    description:
      'Cervejaria artesanal: chope fresco tirado na hora, growlers para levar e chopeira para eventos.',
    identity: { type: 'Organization' },
  },
  devServer: {
    host: DEV_URL,
    https: DEV_KEY && DEV_CERT ? { key: DEV_KEY, cert: DEV_CERT } : undefined,
  },
  compatibilityDate: '2026-10-06',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three', 'three/addons/environments/RoomEnvironment.js'],
    },
  },
  fonts: {
    families: [
      {
        name: 'Big Shoulders',
        provider: 'google',
        global: true,
        weights: ['400', '600', '700', '800', '900'],
        styles: ['normal'],
        subsets: ['latin', 'latin-ext'],
        providerOptions: { google: { experimental: { variableAxis: { opsz: [['10', '72']] } } } },
      },
      {
        name: 'Instrument Sans',
        provider: 'google',
        global: true,
        weights: ['400', '500', '600', '700'],
        styles: ['normal', 'italic'],
        subsets: ['latin', 'latin-ext'],
        providerOptions: { google: { experimental: { variableAxis: { wdth: [['75', '100']] } } } },
      },
      {
        name: 'IBM Plex Mono',
        provider: 'google',
        global: true,
        weights: ['400', '500'],
        styles: ['normal'],
        subsets: ['latin'],
      },
    ],
  },
  i18n: {
    defaultLocale: 'pt',
    locales: [{ code: 'pt', language: 'pt-BR', name: 'Português (BR)' }],
  },
  icon: {
    serverBundle: { collections: ['ph', 'simple-icons'] },
  },
  linkChecker: { enabled: false },
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          "'wasm-unsafe-eval'",
        ],
        'worker-src': ["'self'", 'blob:'],
        'frame-src': ["'self'"],
        'object-src': ["'self'"],
      },
      crossOriginEmbedderPolicy: false,
    },
  },
})
