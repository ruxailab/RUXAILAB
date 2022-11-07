/**
 * heuristic Store Module
 * @module heuristic
 */

 export default {
    state: {
        heuristic: null,
        heuristics: null,
        paginatedTemps: null,
    },
    getters: {
        heuristics(state) {
            return state.heuristics
        },
        heuristic(state) {
            return state.heuristic
        },
        paginatedTemps(state) {
            return state.paginatedTemps
        }
    },
    mutations: {
        setHeuristic(state, payload) {
            state.heuristic = payload
        },
        setHeuristics(state, payload) {
            state.heuristics = payload
        },
        setPaginatedTemps(state, payload) {
            state.paginatedTemps = payload;
        }
    },
    actions: {
        /**
         * This action creates a new heuristic, using the generic action "createObject",
         *  passing the heuristic data
         * 
         * @action createNewHeuristic
         * @param {object} payload - data to create a heuristic 
         * @param {object} payload.data - heuristic data
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - heuristic version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - heuristic title 
         * @param {string} payload.data.header.description - heuristic description 
         * @param {object} payload.data.body - data to creating new tests
         * @param {string} payload.data.body.type - test type
         * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
         * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
         * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
         * @param {object} [payload.data.body.preTest] - object with google form for pretest
         * @param {object} [payload.data.body.preTest] - object with google form for post-test
         * @returns {string} docRef - heuristic identification
         */
        async createNewHeuristic({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'heuristics' });

            let docRef = dispatch('createObject', payload)
                .then((doc) => {
                    return doc.id;
                })
                .catch((err) => commit("setError", "Error in createHeuristic." + err));

            return docRef;
        },


        /**
         * This action updates heuristic, using the generic action "updateObject",
         * passing the heuristic data
         * 
         * @action updateHeuristic
         * @param {object} payload - updated heuristic data 
         * @param {object} payload.data -heuristic data 
         * @param {object} payload.data.header -data for the identification of the model and its author
         * @param {string} payload.data.header.id - author identification
         * @param {string} payload.data.header.author - author email
         * @param {string} payload.data.header.version - heuristic version
         * @param {Date} payload.data.header.date - last update date
         * @param {string} payload.data.header.title - heuristic title 
         * @param {string} payload.data.header.description - heuristic description 
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
        async updateHeuristic({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "heuristics" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateHeuristic." + err));
        },
        /**
         * This action deletes heuristic, using the generic action "deleteObject",
         *  passing the heuristic data
         * 
         * @action deleteHeuristic
         * @param {object} payload - heuristic data 
         * @param {string} payload.id - heuristic identification
         * @returns {void}
         */
        async deleteHeuristic({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "heuristics" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteHeuristic." + err));
        },

        /**
         * This action returns a Heuristic, using the generic action "getObject", 
         * passing the Heuristic data
         * 
         * @action getObjectHeuristic=setHeuristic
         * @param {object} payload - Heuristic data 
         * @param {string} payload.id - Heuristic identification
         * @returns {void}
         */
        async getObjectHeuristic({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'heuristics' });

            let heuristic = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getHeuristic." + err));

            commit('setHeuristic', heuristic);
        },

        async getObjectHeuristicAuthor({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'heuristics' });

            let heuristic = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getHeuristic." + err));

            commit('setHeuristic', heuristic);
        },

        async getObjectHeuristicBody({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: 'heuristics' });

            let heuristic = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getHeuristic." + err));

            commit('setHeuristic', heuristic);
        },

        /**
         * This action returns all Heuristics, using the generic action "getAllObjects"
         * 
         * @action getAllHeuristic=setHeuristics
         * @returns {void}
         */
        async getAllHeuristic({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'heuristics' });

            let heuristics = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getHeuristics." + err));

            commit('setHeuristics', heuristics)
        },
        async getAllHeuristicAuthor({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'heuristics' });

            let heuristics = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getHeuristics." + err));

            commit('setHeuristics', heuristics)
        },
        async getAllHeuristicBody({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'heuristics' });

            let heuristics = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getHeuristics." + err));

            commit('setHeuristics', heuristics)
        },
        async getAllHeuristicHeader({ commit, dispatch }) {
            commit("setLoading", true);
            let payload = Object.assign({}, { collection: 'heuristics' });

            let heuristics = await dispatch("getAllObjects", payload)
                .catch((err) => commit("setError", "Error in getHeuristics." + err));

            commit('setHeuristics', heuristics)
        }
    }
}