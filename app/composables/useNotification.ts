import { useToast } from 'vue-toastification';

export function useNotification() {
  const toast = useToast()

  function notifySuccess(message: string) {
    toast.success(message)
  }

  function notifyError(message: string) {
    toast.error(message)
  }

  function notifyInfo(message: string) {
    toast.info(message)
  }

  function notifyWarning(message: string) {
    toast.warning(message)
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning
  }
}
