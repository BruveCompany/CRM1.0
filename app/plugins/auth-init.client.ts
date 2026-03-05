/**
 * Plugin: auth-init.client.ts
 * Inicialização antecipada do perfil de autenticação.
 *
 * PROBLEMA RESOLVIDO:
 * Sem este plugin, o `fetchProfile()` era disparado dentro de cada composable
 * de forma reativa via watch(user). Isso criava uma race condition onde:
 * 1. Página carregava e montava componentes
 * 2. Componentes configuravam seus watchers
 * 3. O profile ainda não estava disponível
 * 4. Primeiro clique do usuário falhava silenciosamente
 *
 * SOLUÇÃO:
 * Este plugin roda ANTES de qualquer componente montar, garantindo que
 * o fetchProfile() seja disparado o quanto antes no ciclo de vida do app.
 * Como o fetchPromise é agora um useState compartilhado, todas as instâncias
 * do useAuth() aguardam a mesma promessa sem disparar fetches duplicados.
 */
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
    const user = useSupabaseUser()

    if (user.value) {
        // Usuário já está logado — dispara fetchProfile imediatamente
        const { fetchProfile } = useAuth()
        fetchProfile().catch(console.error)
    } else {
        // Aguarda o supabase resolver a sessão e dispara fetch quando disponível
        const unwatch = watch(user, (newUser) => {
            if (newUser) {
                const { fetchProfile } = useAuth()
                fetchProfile().catch(console.error)
                unwatch()
            }
        }, { immediate: false })
    }
})
