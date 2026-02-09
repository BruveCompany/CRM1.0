import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '~/assets/css/toast-custom.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options = {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
  }

  nuxtApp.vueApp.use(Toast, options)
})