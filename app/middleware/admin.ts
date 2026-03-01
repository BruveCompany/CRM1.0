export default defineNuxtRouteMiddleware(async (to, from) => {
    const { checkIsAdmin, profile } = useAuth()

    if (profile.value?.role === 'admin' || profile.value?.role === 'administrador') return

    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
        return navigateTo('/')
    }
})
