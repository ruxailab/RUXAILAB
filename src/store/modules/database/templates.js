/**
 * Templates store module
 * @module templates
 */

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
        /**
         * This action creates a new template, using the generic function "createObject",
         *  passing the template data
         * 
         * @action createTemplate
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
        /**
         * This action returns all templates, using the generic function "getAllObjects"
         * 
         * @action getTemplates=setTemplates
         * @returns {void}
         */
        async getTemplates({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'templates' });

            let templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('setTemplates', templates)
        },
        /**
         * This action returns a template, using the generic function "getObject", 
         * passing the template data
         * 
         * @action getTemplate=setTemplate
         * @param {object} payload - template data 
         * @param {string} payload.id - template identification
         * @returns {void}
         */
        async getTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'templates' });

            let template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('setTemplate', template);
        },
        /**
         * This action updates template, using the generic function "updateObject",
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
        updateTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTemplate." + err));
        },
        /**
         * This action deletes template, using the generic function "deleteObject",
         *  passing the template data
         * 
         * @action deteleTemplate
         * @param {object} payload - template data 
         * @param {string} payload.id - template identification
         * @returns {void}
         */
        deteleTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "templates" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        }
    }
}