import { onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from './useAuth'

export const usePresence = () => {
    const { updateHeartbeat, isAuthenticated } = useAuth()
    let intervalId: any = null

    const startHeartbeat = () => {
        if (intervalId) return

        console.log('🚀 Iniciando ciclo de presença (Heartbeat)...')
        // Envia o primeiro heartbeat imediatamente
        updateHeartbeat()

        // Configura o intervalo para cada 30 segundos
        intervalId = setInterval(() => {
            if (isAuthenticated.value) {
                console.log('📡 Disparando pulso de presença...')
                updateHeartbeat()
            } else {
                console.log('🛑 Autenticação perdida, parando heartbeat.')
                stopHeartbeat()
            }
        }, 120000)
    }

    const stopHeartbeat = () => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    const initPresence = () => {
        onMounted(() => {
            // Monitora a autenticação de forma reativa
            watch(isAuthenticated, (isAuth) => {
                if (isAuth) {
                    startHeartbeat()
                } else {
                    stopHeartbeat()
                }
            }, { immediate: true })
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
