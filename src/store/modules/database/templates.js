export default {
    state: {
        template: null,
        tenplates: null,
    },
    mutations: {
        setTemplate(state, payload) {
            state.template = payload
        },
        setTemplates(state, payload) {
            state.templates = payload
        }
    },
    getters: {
        templates(state) {
            return state.template
        },
        template(state) {
            return state.template
        }
    },
    actions: {
        createTemplate({ dispatch }, payload) {
            payload = Object.assign(payload, { collection: 'templates' })
            dispatch('createObject', payload)
                .catch((err) => {
                    console.error("Error to create template", err)
                })
        }
    }
}