import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'

const controller = new Controller()

export default {
  namespaced: true,

  state: {
    upcomingWebinar: null
  },

  mutations: {
    SET_UPCOMING_WEBINAR(state, payload) {
      state.upcomingWebinar = payload
    }
  },

  actions: {
    async fetchUpcomingWebinar({ commit }) {
      try {
        const snap = await controller.readOne('settings', 'upcomingWebinar')
        if (snap.exists()) {
          commit('SET_UPCOMING_WEBINAR', snap.data())
        }
      } catch (e) {
        console.error('Error fetching upcoming webinar data', e)
      }
    }
  },

  getters: {
    upcomingWebinar: state => state.upcomingWebinar
  }
}
