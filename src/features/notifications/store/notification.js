import UserController from '@/features/auth/controllers/UserController'
const userController = new UserController()

export default {

    actions: {
        async addNotification({ commit }, payload) {
            commit('setLoading', true)
            try {
                await userController.addNotification(payload)
            } catch (e) {
                console.error(e)
                commit('setError', e)
            } finally {
                commit('setLoading', false)
            }
        },

        async markNotificationAsRead({ commit }, payload) {
            commit('setLoading', true)
            try {
                await userController.markNotificationAsRead(payload)
            } catch (e) {
                commit('setError', e)
            } finally {
                commit('setLoading', false)
            }
        },
    },
}
