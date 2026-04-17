
import { defineNuxtPlugin } from '#app'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { mdi } from 'vuetify/lib/iconsets/mdi'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#2196F3',
            secondary: '#03DAC6',
          }
        }
      }
    },
    icons: {
      defaultSet: 'mdi',
      sets: {
        mdi
      }
    }
  })
  
  nuxtApp.vueApp.use(vuetify)
})