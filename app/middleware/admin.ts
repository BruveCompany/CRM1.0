export default defineNuxtRouteMiddleware(async (to, from) => {
    const { checkIsAdmin } = useAuth()

    // Verifica se é admin
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
        // Se não for admin, redireciona para a home
        return navigateTo('/')
    }
})
