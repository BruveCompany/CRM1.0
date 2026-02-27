import { defineNuxtPlugin } from 'nuxt/app'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

export default defineNuxtPlugin((nuxtApp: any) => {
    nuxtApp.vueApp.component('VueDatePicker', VueDatePicker)
})
