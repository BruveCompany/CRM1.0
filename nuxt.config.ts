// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    // Chaves privadas (apenas servidor)
    uazapiApiKey: process.env.UAZAPI_API_KEY,
    uazapiInstanceId: process.env.UAZAPI_INSTANCE_ID,
    uazapiBaseUrl: process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com',
  },
  compatibilityDate: '2026-07-15',
  devtools: {
    enabled: false,
    telemetry: false
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@nuxt/icon'],

  css: [
    '~/components/lead/EditModal.css'
  ],

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm', '/esqueci-senha', '/recuperar-senha']
    }
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['vite/client']
      }
    }
  }
})