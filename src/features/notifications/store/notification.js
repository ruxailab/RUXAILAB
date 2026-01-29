import UserController from '@/features/auth/controllers/UserController'
const userController = new UserController()

export default {
  actions: {
    async addNotification({ commit }, payload) {
      commit('setLoading', true)
      try {
        await userController.addNotification(payload)
      } catch (e) {
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

    async markAllNotificationsAsRead({ commit }, user) {
      commit('setLoading', true)
      try {
        const updatedUser = await userController.markAllNotificationsAsRead(user)
        // Update the root Auth store state with the new user object
        commit('SET_USER', updatedUser, { root: true })
      } catch (e) {
        commit('setError', e)
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
