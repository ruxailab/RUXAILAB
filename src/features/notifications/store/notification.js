import NotificationController from '@/features/notifications/controllers/NotificationController'
const notificationController = new NotificationController()

export default {
  state: {
    notifications: [],
  },
  getters: {
    notifications(state) {
      return state.notifications
    },
  },
  mutations: {
    setNotifications(state, notifications) {
      state.notifications = notifications
    },
  },
  actions: {
    async addNotification({ commit }, payload) {
      commit('setLoading', true)
      try {
        await notificationController.addNotification(payload)
      } catch (e) {
        commit('setError', e)
      } finally {
        commit('setLoading', false)
      }
    },

    subscribeToNotifications({ commit }, userId) {
      return notificationController.subscribeToNotifications(
        userId,
        (notifications) => {
          commit('setNotifications', notifications)
        },
      )
    },

    async markNotificationAsRead({ commit }, payload) {
      commit('setLoading', true)
      try {
        await notificationController.markNotificationAsRead(payload)
      } catch (e) {
        commit('setError', e)
      } finally {
        commit('setLoading', false)
      }
    },

    async markNotificationAsUnread({ commit }, payload) {
      commit('setLoading', true)
      try {
        await notificationController.markNotificationAsUnread(payload)
      } catch (e) {
        commit('setError', e)
      } finally {
        commit('setLoading', false)
      }
    },

    async markAllNotificationsAsRead({ commit }, payload) {
      commit('setLoading', true)

      try {
        await notificationController.markAllNotificationsAsRead(payload)
      } catch (e) {
        commit('setError', e)
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
