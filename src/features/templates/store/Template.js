/**
 * Template Store Module
 * @module Template
 */

//import TemplateController
import TemplateController from '@/features/templates/controllers/TemplateController.js'

const templateController = new TemplateController()

export default {
  state: {
    templates: null,
    publicTemplates: [],
    myTemplates: [],
    currentTemplate: null,
    module: 'Templates',
  },
  getters: {},
  mutations: {
    SET_TEMPLATES(state, payload) {
      state.templates = payload
    },
    SET_PUBLIC_TEMPLATES(state, payload) {
      state.publicTemplates = payload
    },
    SET_MY_TEMPLATES(state, payload) {
      state.myTemplates = payload
    },
    SET_CURRENT_TEMPLATE(state, payload) {
      state.currentTemplate = payload
    },
  },
  actions: {
    async createTemplate({ commit }, payload) {
      try {
        commit('setLoading', true)
        await templateController.createTemplate(payload)
      } catch (e) {
        commit('setError', {
          errorCode: 'Error',
          message: 'createTemplate failed',
        })
        return e
      } finally {
        commit('setLoading', false)
      }
    },
    async getPublicTemplates({ commit }) {
      try {
        commit('setLoading', true)
        const res = await templateController.getPublicTemplates()
        commit('SET_PUBLIC_TEMPLATES', res)
        commit('SET_TEMPLATES', res)
      } catch (e) {
        return e
      } finally {
        commit('setLoading', false)
      }
    },
    async getTemplatesOfUser({ commit, rootState }) {
      try {
        commit('setLoading', true)
        const res = await templateController.getTemplatesOfUser(
          rootState.Auth.user.id,
        )
        commit('SET_MY_TEMPLATES', res)
        commit('SET_TEMPLATES', res)
      } catch (e) {
        return e
      } finally {
        commit('setLoading', false)
      }
    },
    async deleteTemplate({ commit }, payload) {
      try {
        commit('setLoading', true)
        await templateController.deleteTemplate(payload)
      } catch (e) {
        return e
      } finally {
        commit('setLoading', false)
      }
    },
    async getTemplateById({ commit }, payload) {
      try {
        commit('setLoading', true)
        const template = await templateController.getTemplateById(payload)
        commit('SET_CURRENT_TEMPLATE', template)
        return template
      } catch {
        return null
      } finally {
        commit('setLoading', false)
      }
    },
    async updateTemplate({ commit }, payload) {
      try {
        commit('setLoading', true)
        await templateController.updateTemplate(payload.id, payload.data)
        const template = await templateController.getTemplateById(payload.id)
        commit('SET_CURRENT_TEMPLATE', template)
        return template
      } catch (e) {
        return e
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
