import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from './useAuth'

// Estado global de usuários online via WebSocket (Presença Realtime)
// Chave: Profile ID, Valor: Dados do usuário
export const onlineUsers = useState<Record<string, any>>('presence-online-users', () => ({}))

export const usePresence = () => {
    const supabase = useSupabaseClient()
    const { profile, isAuthenticated, updateHeartbeat } = useAuth()
    let presenceChannel: any = null
    let heartbeatInterval: any = null

    const setupPresence = () => {
        if (!profile.value || presenceChannel) return

        console.log('🔌 Presença: Iniciando canal Realtime Presence...')

        presenceChannel = supabase.channel('global-presence', {
            config: {
                presence: {
                    key: String(profile.value.id),
                },
            },
        })

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState()
                const onlineMap: Record<string, any> = {}

                Object.keys(state).forEach((key) => {
                    onlineMap[key] = state[key][0]
                })

                onlineUsers.value = onlineMap
                console.log('👥 Presença: Usuários online sincronizados:', Object.keys(onlineMap).length)
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
                console.log('🟢 Presença: Usuário entrou:', key)
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
                console.log('🔴 Presença: Usuário saiu:', key)
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    console.log('📡 Presença: Inscrito com sucesso. Rastreiando perfil:', profile.value.id)
                    await presenceChannel.track({
                        id: profile.value.id,
                        nome: profile.value.nome,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        // Mantemos um heartbeat longo (10 minutos) apenas para registro histórico no banco
        // mas a UI agora usará o Socket para o "ao vivo".
        heartbeatInterval = setInterval(() => {
            if (isAuthenticated.value) {
                console.log('💓 Presença: Atualizando registro histórico (Last Seen)...')
                updateHeartbeat()
            }
        }, 600000) // 10 minutos
    }

    const cleanupPresence = () => {
        if (presenceChannel) {
            console.log('🔌 Presença: Desconectando canal...')
            supabase.removeChannel(presenceChannel)
            presenceChannel = null
        }
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval)
            heartbeatInterval = null
        }
    }

    const initPresence = () => {
        onMounted(() => {
            watch(isAuthenticated, (isAuth) => {
                if (isAuth) {
                    setupPresence()
                } else {
                    cleanupPresence()
                }
            }, { immediate: true })

            // Caso o perfil demore a carregar
            watch(profile, (p) => {
                if (p && isAuthenticated.value) {
                    setupPresence()
                }
            })
        })

        onUnmounted(() => {
            cleanupPresence()
        })
    }

    return {
        initPresence,
        onlineUsers
    }
}
