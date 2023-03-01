/**
 * Template Store Module
 * @module Template
 */

//import TemplateController
import TemplateController from "@/controllers/TemplateController.js";

const TemplateCont = new TemplateController();

export default {
    state: {
        Templates: null,
        module: "Templates",
    },
    getters: {
        Templates(state) {
            return state.Templates;
        },
        paginatedTemps(state) {
            return state.paginatedTemps;
        },
    },
    mutations: {
        SET_TEMPLATES(state, payload) {
            state.Templates = payload;
        },
        SET_PAGINATED_TEMPS(state, payload) {
            state.paginatedTemps = payload;
        },
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
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {string} docRef - Template identification
         */

        async createTemplate({ commit }, payload) {
            commit("setLoading", true);
            //Connect to controllers
            try {
                const res = await TemplateCont.createTemplate(
                    payload.toFirestore()
                );
                commit("SET_TEMPLATES", res);
            } catch (e) {
                console.log("Error in createTemplate");
                console.log(e);
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
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

            dispatch("updateObject", payload).catch((err) =>
                commit("setError", "Error in updateTemplate." + err)
            );

            //Connect to controllers
            try {
                const res = await TemplateCont.updateTemplate();
                commit("SET_TEMPLATES", res);
            } catch {
                console.log("Error in updateTemplate");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
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

            dispatch("deleteObject", payload).catch((err) =>
                commit("setError", "Error in deleteTemplate." + err)
            );

            //Connect to controllers
            try {
                const res = await TemplateCont.deleteTemplate();
                commit("SET_TEMPLATES", res);
            } catch {
                console.log("Error in deleteTemplate");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        /**
         * This action returns a Template, using the generic action "getObject",
         * passing the Template data
         *
         * @action getObjectTemplate=SET_TEMPLATES
         * @param {object} payload - Template data
         * @param {string} payload.id - Template identification
         * @returns {void}
         */

        async getObjectTemplate({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Templates" });

            let Template = await dispatch("getObject", payload).catch((err) =>
                commit("setError", "Error in getTemplate." + err)
            );

            commit("SET_TEMPLATES", Template);

            //Connect to controllers
            try {
                const res = await TemplateCont.getObjectTemplate();
                commit("SET_TEMPLATES", res);
            } catch {
                console.log("Error in getObjectTemplate");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        /**
         * This action returns all Templates, using the generic action "getAllObjects"
         *
         * @action getAllTemplate=SET_TEMPLATES
         * @returns {void}
         */

        async getAllTemplates({ commit }) {
            console.log("getting all templates");
            commit("setLoading", true);

            //Connect to controllers
            try {
                const res = await TemplateCont.getAllTemplates();
                commit("SET_TEMPLATES", res);
            } catch {
                console.log("Error in getAllTemplate");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },
    },
};
