/**
 * Template Store Module
 * @module template
 */

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
        /**
         * This action creates a new template, using the generic action "createObject",
         *  passing the template data
         * 
         * @action createNewTemplate
         * @param {object} payload - data to create a template 
         * @param {object} payload.data - template data
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - template version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - template title 
         * @param {string} payload.data.header.description - template description 
         * @param {object} payload.data.body - data to creating new tests
         * @param {string} payload.data.body.type - test type
         * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {string} docRef - template identification
         */
        async createNewTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let docRef = dispatch('createObject', payload)
                .then((doc) => {
                    return doc.id;
                })
                .catch((err) => commit("setError", "Error in createTemplate." + err));

            return docRef;
        },


        /**
         * This action updates template, using the generic action "updateObject",
         * passing the template data
         * 
         * @action updateTemplate
         * @param {object} payload - updated template data 
         * @param {object} payload.data -template data 
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - template version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - template title 
         * @param {string} payload.data.header.description - template description 
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
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTemplate." + err));
        },
        /**
         * This action deletes template, using the generic action "deleteObject",
         *  passing the template data
         * 
         * @action deleteTemplate
         * @param {object} payload - template data 
         * @param {string} payload.id - template identification
         * @returns {void}
         */
        async deleteTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        },

        /**
         * This action returns a template, using the generic action "getObject", 
         * passing the template data
         * 
         * @action getObjectTemplate=setTemplate
         * @param {object} payload - template data 
         * @param {string} payload.id - template identification
         * @returns {void}
         */
        async getObjectTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },

        async getObjectTemplateAuthor({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },

        async getObjectTemplateBody({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },

        /**
         * This action returns all templates, using the generic action "getAllObjects"
         * 
         * @action getAllTemplate=setTemplates
         * @returns {void}
         */
        async getAllTemplate({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },
        async getAllTemplateAuthor({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },
        async getAllTemplateBody({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },
        async getAllTemplateHeader({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        }
    }
}