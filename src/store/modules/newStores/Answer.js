import AnswerController from "@/controllers/AnswerController.js";

const answerController = new AnswerController();

export default {
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {
        async updateUserAnswer({ commit }, payload) {
            commit("setLoading", true);
            try {
                await answerController.updateUserAnswer(payload)
            } catch (e) {
                console.error("Error in updateTest", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },
    }
};
