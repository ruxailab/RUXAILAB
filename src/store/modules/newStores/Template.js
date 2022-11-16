/**
 * Template Store Module
 * @module Template
 */

export default {
    state: {
        Template: null,
        Templates: null,
        PaginatedTemps: null,
    },
    getters: {
        Templates(state) {
            return state.Templates
        },
        Template(state) {
            return state.Template
        },
        PaginatedTemps(state) {
            return state.PaginatedTemps
        }
    },
    mutations: {
        setTemplate(state, payload) {
            state.Template = payload
        },
        setTemplates(state, payload) {
            state.Templates = payload
        },
        setPaginatedTemps(state, payload) {
            state.PaginatedTemps = payload;
        }
    },
    actions: {
        /**
         * This action creates a new Template, using the generic action "createObject",
         *  passing the Template data
         * 
         * @action createNewTemplate
         * @param {object} payload - data to create a Template 
         * @param {object} payload.data - Template data
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - Template version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - Template title 
         * @param {string} payload.data.header.description - Template description 
         * @param {object} payload.data.body - data to creating new tests
         * @param {string} payload.data.body.type - test type
         * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {string} docRef - Template identification
         */
        async createNewTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let docRef = dispatch('createObject', payload)
                .then((doc) => {
                    return doc.id;
                })
                .catch((err) => commit("setError", "Error in createTemplate." + err));

            return docRef;
        },


        /**
         * This action updates Template, using the generic action "updateObject",
         * passing the Template data
         * 
         * @action updateTemplate
         * @param {object} payload - updated Template data 
         * @param {object} payload.data -Template data 
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - Template version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - Template title 
         * @param {string} payload.data.header.description - Template description 
         * @param {object} payload.data.body - data to creating new tests
         * @param {string} payload.data.body.type - test type
         * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {void}
         */
        async updateTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Templates" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTemplate." + err));
        },
        /**
         * This action deletes Template, using the generic action "deleteObject",
         *  passing the Template data
         * 
         * @action deleteTemplate
         * @param {object} payload - Template data 
         * @param {string} payload.id - Template identification
         * @returns {void}
         */
        async deleteTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Templates" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        },

        /**
         * This action returns a Template, using the generic action "getObject", 
         * passing the Template data
         * 
         * @action getObjectTemplate=setTemplate
         * @param {object} payload - Template data 
         * @param {string} payload.id - Template identification
         * @returns {void}
         */
        async getObjectTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', Template);
        },

        async getObjectTemplateAuthor({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', Template);
        },

        async getObjectTemplateBody({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', Template);
        },

        /**
         * This action returns all Templates, using the generic action "getAllObjects"
         * 
         * @action getAllTemplate=setTemplates
         * @returns {void}
         */
        async getAllTemplate({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', Templates)
        },
        async getAllTemplateAuthor({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', Templates)
        },
        async getAllTemplateBody({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', Templates)
        },
        async getAllTemplateHeader({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', Templates)
        }
    }
}