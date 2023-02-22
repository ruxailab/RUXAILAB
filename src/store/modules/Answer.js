import AnswerController from "@/controllers/AnswerController.js";
import HeuristicAnswer from "@/models/HeuristicAnswer";
import TaskAnswer from "@/models/TaskAnswer";
const answerController = new AnswerController();

export default {
    state: {
        testAnswerDocument: null
    },
    getters: {
        testAnswerDocument(state) {
            return state.testAnswerDocument
        },
        currentUserTestAnswer(state, rootState) {
            if (state.testAnswerDocument) {
                if (state.testAnswerDocument.type === 'HEURISTICS') {
                    return state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`] ? HeuristicAnswer.toHeuristicAnswer(state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`]) : new HeuristicAnswer({
                        userDocId: rootState.user.id,
                    })
                } else if (state.type === 'USER') {
                    return TaskAnswer.toTaskAnswer(state.testAnswerDocument.taskAnswers[`${rootState.user.id}`]) ?? new TaskAnswer({
                        userDocId: rootState.user.id,
                    })
                }
            }
            return {}
        }
    },
    mutations: {
        SET_ANSWER_DOCUMENT(state, payload) {
            state.testAnswerDocument = payload
        }
    },
    actions: {
        async getCurrentTestAnswerDoc({ commit, rootState }) {
            const currentTest = rootState.Tests.Test
            const currentAnswerDocId = currentTest.answersDocId
            commit("setLoading", true);
            try {
                const answerDoc = await answerController.getAnswerById(currentAnswerDocId)
                commit('SET_ANSWER_DOCUMENT', answerDoc)
            } catch (e) {
                console.error("Error in updateTest", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },
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
        async removeTestFromCooperator({ commit }, payload) {
            commit("setLoading", true);
            try {
                await answerController.removeUserAnswer({
                    cooperatorId: payload.cooperator.userDocId,
                    testDocId: payload.test.id
                })
            } catch (e) {
                console.error("Error in updateTest", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },
        async saveTestAnswer({ commit }, payload) {
            commit("setLoading", true);
            try {
                await answerController.saveTestAnswer(payload.data, payload.answerDocId)
            } catch (e) {
                console.error("Error in save test answer", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        }
    }
};
