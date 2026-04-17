export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: [
    'vuetify/styles',
    '~/assets/css/main.css'
  ],

  build: {
    transpile: ['vuetify']
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'workbox-window'
      ]
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['pwa-192.png', 'pwa-512.png'],
    manifest: {
      id: '/',
      name: 'PDF Mescle',
      short_name: 'PDF Mescle',
      description: 'Mescle seus PDFs com ordem personalizada direto no celular ou no PC.',
      lang: 'pt-BR',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#f5f7ff',
      theme_color: '#2257ff',
      icons: [
        {
          src: '/pwa-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/pwa-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/'
    }
  }
})