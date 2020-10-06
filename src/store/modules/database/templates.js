
export default {
    state: {
        template: null,
        templates: null,
    },
    getters: {
        templates(state) {
            return state.templates
        },
        template(state) {
            return state.template
        }
    },
    mutations: {
        setTemplate(state, payload) {
            state.template = payload
        },
        setTemplates(state, payload) {
            state.templates = payload
        }
    },
    actions: {
        createTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let docRef = dispatch('createObject', payload)
                .then((doc) => {
                    return doc.id;
                })
                .catch((err) => commit("setError", "Error in createTemplate." + err));

            return docRef;
        },
        async getTemplates({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },
        async getTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },
        updateTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTemplate." + err));
        },
        deteleTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        }
    }
}