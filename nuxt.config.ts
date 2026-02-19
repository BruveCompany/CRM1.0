// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-15', // Você pode manter sua data, ou usar a do professor se preferir
  devtools: {
    enabled: false,
    telemetry: false
  }, // Mantenha como true para desenvolvimento
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt'],

  supabase: {
    redirect: true, // <-- ADICIONAR ESTA LINHA!
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm', '/esqueci-senha', '/recuperar-senha'] // <-- ADICIONAR '/confirm' AQUI!
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