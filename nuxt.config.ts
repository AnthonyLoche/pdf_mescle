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

  modules: ['@nuxtjs/tailwindcss']
})