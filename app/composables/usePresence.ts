import { onMounted, onUnmounted } from 'vue'
import { useAuth } from './useAuth'

export const usePresence = () => {
    const { updateHeartbeat, isAuthenticated } = useAuth()
    let intervalId: any = null

    const startHeartbeat = () => {
        if (intervalId) return

        // Envia o primeiro heartbeat imediatamente
        updateHeartbeat()

        // Configura o intervalo para cada 30 segundos
        intervalId = setInterval(() => {
            if (isAuthenticated.value) {
                updateHeartbeat()
            } else {
                stopHeartbeat()
            }
        }, 30000)
    }

    const stopHeartbeat = () => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    const initPresence = () => {
        onMounted(() => {
            if (isAuthenticated.value) {
                startHeartbeat()
            }
        })

        onUnmounted(() => {
            stopHeartbeat()
        })
    }

    return {
        initPresence,
        startHeartbeat,
        stopHeartbeat
    }
}
