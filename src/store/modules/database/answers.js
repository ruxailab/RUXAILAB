/**
 * Answers store module
 * @module answers
 */

export default {
  state: {
    answers: null,
  },
  getters: {
    answers(state) {
      return state.answers
    }
  },
  mutations: {
    setAnswers(state, payload) {
      state.answers = payload;
    }
  },
  actions: {
    /**
     * This action creates a new answers document, 
     * using the generic action [createObject]{@linkcode module-database.html#createObject},
     * passing the Answer data
     * 
     * @action createAnswers
     * @param {object} payload - data to create a answer document
     * @param {object} payload.data -  answers documents data
     * @param {object} payload.data.test -  header with test data to which the answers document belongs
     * @param {string} payload.data.test.id - the test identification
     * @param {string} payload.data.test.title - the test title
     * @param {string} payload.data.test.type - the test type
     * @param {object[]} payload.data.answers -  evaluators' answers
     * @param {object} payload.data.answersSheet -  standard object to answer the test  
     * @param {object} payload.data.options - alternatives to respond when your type is heuristic
     * @returns {string} docId - answers document identification
     */
    createAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      let docId = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => commit("setError", "Error in createAnswers." + err));

      return docId;
    },
    /**
     * This action adds a new evaluator's answer into answers document, 
     * using the generic action {@link pushObject}, 
     * passing the Answer data  
     *    
     * @action pushAnswers
     * @param {object} payload - evaluator's answer data
     * @param {string} payload.docId - Answers document identification
     * @param {object} payload.element -evaluator's answer data
     * @param {string} payload.element.uid - evaluator identification 
     * @param {string} payload.element.email - evaluator email
     * @param {number} payload.element.total - total questions answered
     * @param {number} payload.element.progress - complete test percentage
     * @param {object[]} payload.element.heuristics - answers
     * @returns {void}
     */
    pushAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "answers",
        param: "answers",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushAnswers." + err));
    },
    /**
     * This action gets the answers document, 
     * using the generic action {@link getObject}, 
     * passing the response data
     * 
     * @action getAnswers=setAnswers
     * @param {object} payload - answers data
     * @param {string} payload.id - answers document identification
     * @returns {void}
     */
    async getAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      let ans = await dispatch("getObject", payload)
        .catch((err) => commit("setError", "Error in getAnswers." + err));

      commit("setAnswers", ans);
    },
    /**
     * This action deletes the answers document, 
     * using the generic action {@link deleteObject}, 
     * passing the response data
     * 
     * @action deleteAnswers
     * @param {object} payload - answers document data
     * @param {string} payload.id - answers document identification
     * @returns {void} 
     */
    deleteAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      dispatch("deleteObject", payload)
        .catch((err) => commit("setError", "Error in deleteAnswers." + err));
    },
    /** 
     * This action updates the answers document, 
     * using the generic action {@link updateObject }, 
     * passing the response data
     * 
     * @action updateTestAnswer
     * @param {object} payload - updated data 
     * @param {string} payload.docId - answers document identification
     * @param {object} payload.data - updated answers document data
     * @param {object} payload.data.test -  header with test data to which the answers document belongs
     * @param {string} payload.data.test.id - the test identification
     * @param {string} payload.data.test.title - the test title
     * @param {string} payload.data.test.type - the test type
     * @param {object[]} payload.data.answers -  evaluators' answers
     * @param {object} payload.data.answersSheet -  standard object to answer the test  
     * @param {object} payload.data.options - alternatives to respond when your type is heuristic
     * @returns {void}
     */
    updateTestAnswer({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      dispatch("updateObject", payload)
        .catch((err) => commit("setError", "Error in updateTestAnswer." + err));
    },
  },
};
