export default {
    state: {
        answers: null,
        answer: null,
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

        // create answer
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

        // update answer
        updateTestAnswer({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            dispatch("updateObject", payload)
                .catch((err) => commit("setError", "Error in updateTestAnswer." + err));
        },

        // delete answer
        deleteAnswers({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            dispatch("deleteObject", payload)
                .catch((err) => commit("setError", "Error in deleteAnswers." + err));
        },

        // get all answers
        async getAllAnswers({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            let answers = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getAnswers." + err));

            commit("setAnswers", answers);
        },

        // get answers by id
        async getAnswerById({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            let answer = await dispatch("getObject", payload)
                .catch((err) => commit("setError", "Error in getAnswers." + err));

            commit("setAnswers", answer);
        },

    }

}
