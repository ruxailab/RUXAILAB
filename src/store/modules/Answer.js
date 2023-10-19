import AnswerController from '@/controllers/AnswerController'
import HeuristicAnswer from '@/models/HeuristicAnswer'
import TaskAnswer from '@/models/TaskAnswer'
import { percentage } from '@/utils/statistics'

const answerController = new AnswerController()

export default {
  state: {
    testAnswerDocument: null,
    answers: [],
    evaluatorStatistics: [],
    finalReport: [],
  },
  getters: {
    testAnswerDocument(state) {
      return state.testAnswerDocument
    },
    currentUserTestAnswer(state, rootState) {
      if (!state.testAnswerDocument) {
        return {}
      }

      if (state.testAnswerDocument.type === 'HEURISTICS') {
        return state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`]
          ? HeuristicAnswer.toHeuristicAnswer(
              state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`],
            )
          : new HeuristicAnswer({
              userDocId: rootState.user.id,
            })
      }

      if (state.testAnswerDocument.type === 'User') {
        return (
          TaskAnswer.toTaskAnswer(
            state.testAnswerDocument.taskAnswers[`${rootState.user.id}`],
          ) ??
          new TaskAnswer({
            userDocId: rootState.user.id,
          })
        )
      }
    },
  },
  mutations: {
    SET_ANSWER_DOCUMENT(state, payload) {
      state.testAnswerDocument = payload
    },
    SET_ANSWERS(state, payload) {
      state.answers = payload
    },
    SET_EVALUATOR_STATISTICS(state, payload) {
      state.evaluatorStatistics = payload
    },
  },
  actions: {
    async getCurrentTestAnswerDoc({ commit, rootState }) {
      const currentTest = rootState.Tests.Test
      const currentAnswerDocId = currentTest.answersDocId
      commit('setLoading', true)
      try {
        const answerDoc = await answerController.getAnswerById(
          currentAnswerDocId,
        )
        commit('SET_ANSWER_DOCUMENT', answerDoc)
      } catch (e) {
        console.error('Error in updateTest', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async updateUserAnswer({ commit }, payload) {
      commit('setLoading', true)
      try {
        await answerController.updateUserAnswer(payload)
      } catch (e) {
        console.error('Error in updateTest', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async removeTestFromCooperator({ commit }, payload) {
      commit('setLoading', true)
      try {
        await answerController.removeUserAnswer({
          cooperatorId: payload.cooperator.userDocId,
          testDocId: payload.test.id,
        })
      } catch (e) {
        console.error('Error in updateTest', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async saveTestAnswer({ commit }, payload) {
      commit('setLoading', true)
      try {
        await answerController.saveTestAnswer(payload.data, payload.answerDocId)
      } catch (e) {
        console.error('Error in save test answer', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async processStatistics({ commit }, payload) {
      let table = {
        header: [],
        items: [],
      }

      table.header = [
        {
          text: 'Evaluator',
          align: 'start',
          sortable: false,
          value: 'evaluator',
        },
        {
          text: 'Usability Percentage',
          value: 'result',
          align: 'center',
        },
        {
          text: 'Applicable Question(s)',
          value: 'aplication',
          align: 'center',
        },
        {
          text: 'No Applicable Question(s)',
          value: 'noAplication',
          align: 'center',
        },
        {
          text: 'Conclusion Percentage',
          value: 'answered',
          align: 'center',
        },
      ]

      if (payload.resultEvaluator) {
        payload.resultEvaluator.forEach((evaluator) => {
          let totalNoAplication = 0
          let totalNoReply = 0
          let totalQuestions = 0

          evaluator.heuristics.forEach((heuristic) => {
            totalNoAplication += heuristic.totalNoAplication
            totalNoReply += heuristic.totalNoReply
            totalQuestions += heuristic.totalQuestions
          })

          table.items.push({
            evaluator: evaluator.id,
            result: evaluator.result,
            aplication: totalQuestions - totalNoAplication,
            noAplication: totalNoAplication,
            answered: percentage(
              totalQuestions - totalNoReply,
              totalQuestions,
            ).toFixed(2),
          })
        })
      }

      commit('SET_EVALUATOR_STATISTICS', table)
    },
  },
}
