import Controller from '@/controllers/BaseController'

/**
 * Database store module, API calls
 * @module database
 */

export default {
  state: {
    loading: false,
  },
  getters: {
    loading(state) {
      return state.loading
    },
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload
    },
  },
  actions: {
    async getPaginationArray({ commit }, payload) {
      try {
        var objects = []
        await new Controller().read('users', 'id', payload).then((response) => {
          response.forEach((doc) => {
            objects.push(doc.data())
          })
        })
      } catch (err) {
        console.error('Error in getPaginationArray: ', err)
        commit('setError', 'Error in getting paginated array in database')
      } finally {
        commit('setLoading', false)
      }
    },
    async getObject({ commit }, payload) {
      try {
        const x = await new Controller().readOne(
          payload.collection,
          'id',
          payload.id,
        )
        return x.data()
      } catch (err) {
        console.error('Error in getObject:', err),
          commit('setError', 'Error getting object from database')
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
