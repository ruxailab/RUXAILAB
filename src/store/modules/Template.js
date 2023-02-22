/**
 * Template Store Module
 * @module Template
 */

//import TemplateController
import TemplateController from '@/controllers/TemplateController.js'

const templateController = new TemplateController()


export default {
    state: {
        templates: null,
        module: 'Templates'
    },
    getters: {
    },
    mutations: {
        SET_TEMPLATES(state, payload) {
            state.templates = payload
        }
    },
    actions: {
        async createTemplate({ commit }, payload) {
            try {
                commit("setLoading", true);
                await templateController.createTemplate(payload)
            } catch (e) {
                console.log('Error in createTemplate')
                console.log(e)
                commit('setError', true)

            } finally {
                commit('setLoading', false)
            }
        },
        async getPublicTemplates({ commit }) {
            try {
                commit("setLoading", true);
                const res = await templateController.getPublicTemplates()
                commit('SET_TEMPLATES', res)
            } catch (e) {
                console.error(e)
            } finally {
                commit('setLoading', false)
            }
        }
    }
}