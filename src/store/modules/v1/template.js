export default {
    state: {
        template: null,
        templates: null,
        paginatedTemps: null,
    },
    getters: {
        templates(state) {
            return state.templates
        },
        template(state) {
            return state.template
        },
        paginatedTemps(state) {
            return state.paginatedTemps
        }
    },
    mutations: {
        setTemplate(state, payload) {
            state.template = payload
        },
        setTemplates(state, payload) {
            state.templates = payload
        },
        setPaginatedTemps(state, payload) {
            state.paginatedTemps = payload;
        }
    },
    actions: {
        // create template
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

        // get all templates
        async getTemplates({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },

        // get template by id
        async getTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },

        // update template
        updateTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTemplate." + err));
        },

        // delete template
        deteleTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        },

    }
}

