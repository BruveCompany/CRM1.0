// Estado compartilhado fora da função para persistir entre chamadas do composable
const onlineUsers = () => useState<Record<string, any>>('presence-online-users', () => ({}))
let presenceChannel: any = null
let heartbeatInterval: any = null

export const usePresence = () => {
    const supabase = useSupabaseClient()
    const { profile, isAuthenticated, updateHeartbeat } = useAuth()

    // Estado global de usuários online via WebSocket (Presença Realtime)
    const socketOnlineUsers = onlineUsers()

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

                socketOnlineUsers.value = onlineMap
                console.log('👥 Presença: Usuários online sincronizados:', Object.keys(onlineMap))
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

        // Heartbeat longo (10 minutos) para o banco de dados
        heartbeatInterval = setInterval(() => {
            if (isAuthenticated.value) {
                console.log('💓 Presença: Atualizando registro histórico (Last Seen)...')
                updateHeartbeat()
            }
        }, 600000)
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
        socketOnlineUsers.value = {}
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

            watch(profile, (p) => {
                if (p && isAuthenticated.value) {
                    setupPresence()
                }
            })
        })

        onUnmounted(() => {
            // No root (app.vue) o cleanup é importante ao fazer logout
        })
    }

    return {
        initPresence,
        onlineUsers: socketOnlineUsers
    }
}
