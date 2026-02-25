/**
 * User store module
 * @module user
 */

// import UserController
import UserController from '@/features/auth/controllers/UserController'

const userController = new UserController()

export default {
  state: {
    users: null,
    module: 'user',
  },

  getters: {
    admins(state) {
      return state.users.filter((item) => item.accessLevel === 1)
    },

    users(state) {
      return state.users
    },
  },

  mutations: {
    SET_USERS(state, payload) {
      state.users = payload
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter((user) => user.id !== userId)
    },
  },

  actions: {
    async getAllUsers({ commit }) {
      try {
        const res = await userController.readAll()
        commit('SET_USERS', res)
      } catch (e) {
        return e
      }
    },

    async updateLevel({ commit }, { data }) {
      commit('setLoading', true)
      try {
        await userController.updateLevel(
          data.uid,
          data.customClaims.accessLevel,
        )
        const updatedUsers = await userController.readAll()
        commit('SET_USERS', updatedUsers)
      } catch (e) {
        return e
      } finally {
        commit('setLoading', false)
      }
    },

    async deleteUser({ commit }, user) {
      commit('setLoading', true)
      try {
        const { default: AuthController } =
          await import('@/features/auth/controllers/AuthController')
        const authController = new AuthController()

        await authController.deleteUserData(user.id)
        commit('REMOVE_USER', user.id)
      } catch (e) {
        throw e
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
