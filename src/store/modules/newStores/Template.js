/**
 * Template Store Module
 * @module Template
 */

//import TemplateController
import TemplateController from '@/controllers/TemplateController.js'

const TemplateCont = new TemplateController()


export default {
    state: {
        Templates: null,
        module: 'Templates'
    },
    getters: {
        Templates(state) {
            return state.Templates
        }
    },
    mutations: {
        SET_TEMPLATES(state, payload) {
            state.Templates = payload
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
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {string} docRef - Template identification
         */

        async createTemplate({ dispatch, commit }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: 'Templates' });

            let docRef = dispatch('createObject', payload)
                .then((doc) => {
                    return doc.id;
                })
                .catch((err) => commit("setError", "Error in createTemplate." + err));

            

            //Connect to controllers
            try{
                const res = await TemplateCont.createTemplate()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in createTemplate')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }

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
        
            
            //Connect to controllers
            try{
                const res = await TemplateCont.updateTemplate()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in updateTemplate')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
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

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteTemplate." + err));
        
        
            //Connect to controllers
            try{
                const res = await TemplateCont.deleteTemplate()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in deleteTemplate')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
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
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('SET_TEMPLATES', Template);

            //Connect to controllers
            try{
                const res = await TemplateCont.getObjectTemplate()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getObjectTemplate')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getObjectTemplateAuthor({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('SET_TEMPLATES', Template);

            //Connect to controllers
            try{
                const res = await TemplateCont.getObjectTemplateAuthor()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getObjectTemplateAuthor')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getObjectTemplateBody({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('SET_TEMPLATES', Template);

            //Connect to controllers
            try{
                const res = await TemplateCont.getObjectTemplateBody()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getObjectTemplateBody')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getObjectTemplateHeader({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'Templates' });

            let Template = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getTemplate." + err));

            commit('SET_TEMPLATES', Template);

            //Connect to controllers
            try{
                const res = await TemplateCont.getObjectTemplateHeader()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getObjectTemplateHeader')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },


        /**
         * This action returns all Templates, using the generic action "getAllObjects"
         * 
         * @action getAllTemplate=SET_TEMPLATES
         * @returns {void}
         */

        async getAllTemplate({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('SET_TEMPLATES', Templates)

            //Connect to controllers
            try{
                const res = await TemplateCont.getAllTemplate()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getAllTemplate')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getAllTemplateAuthor({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('SET_TEMPLATES', Templates)

            //Connect to controllers
            try{
                const res = await TemplateCont.getAllTemplateAuthor()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getAllTemplateAuthor')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getAllTemplateBody({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('SET_TEMPLATES', Templates)

            //Connect to controllers
            try{
                const res = await TemplateCont.getAllTemplateBody()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getAllTemplateBody')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getAllTemplateHeader({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'Templates' });

            let Templates = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getTemplates." + err));

            commit('SET_TEMPLATES', Templates)

            //Connect to controllers
            try{
                const res = await TemplateCont.getAllTemplateHeader()
                commit('SET_TEMPLATES', res)

            } catch{
                console.log('Error in getAllTemplateHeader')
                commit('setError', true)

            } finally{
                commit('setLoading', false)
            }
        },

        async getPaginationTemplates({ dispatch, commit }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: "templates" });

            let temps = await dispatch("getPaginationArray", payload)
                .catch((err) => commit("setError", "Error in getPaginationTemplates." + err));
            
            commit("setPaginatedTemps", temps);
        }
    }
}