import AnswerController from '@/shared/controllers/AnswerController'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'
import { percentage } from '@/ux/Heuristic/utils/statistics'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'

const answerController = new AnswerController()

export default {
  state: {
    testAnswerDocument: null,
    answers: [],
    evaluatorStatistics: [],
    finalReport: [],
  },
  getters: {
    testAnswerDocument(state, rootState) {
      if (rootState.test) {
        const testOptions = rootState.test.testOptions

        if (state.testAnswerDocument && state.testAnswerDocument.heuristicAnswers) {
          for (const [key, value] of Object.entries(state.testAnswerDocument.heuristicAnswers)) {
            value.heuristicQuestions.forEach(heuristic => {
              heuristic.heuristicQuestions.forEach(question => {
                question.heuristicAnswer = question.heuristicAnswer?.text ? question.heuristicAnswer : {
                  text: testOptions.find(op => op.value === question.heuristicAnswer)?.text ?? "", value: question.heuristicAnswer,
                }
              })
            })
          }
        }
      }

      return state.testAnswerDocument
      // return {}
    },
    currentUserTestAnswer(state, rootState) {
      if (!state.testAnswerDocument) {
        return {};
      }

      // Guard against undefined rootState.test or rootState.test.testStructure
      if (!rootState.test || !rootState.test.testStructure) {
        return {};
      }
      if (!rootState.user) {
        return {}
      }

      if (state.testAnswerDocument.type === STUDY_TYPES.HEURISTIC) {
        const answers = state.testAnswerDocument.heuristicAnswers || {};
        const userAnswer = answers[rootState.user.id];

        return userAnswer
          ? HeuristicAnswer.toHeuristicAnswer(
            userAnswer,
            rootState.test.testOptions,
          )
          : new HeuristicAnswer({
            userDocId: rootState.user.id,
          });
      }

      if (state.testAnswerDocument.type === STUDY_TYPES.USER) {
        return state.testAnswerDocument.taskAnswers[`${rootState.user.id}`]
          ? UserStudyEvaluatorAnswer.toModel(
            state.testAnswerDocument.taskAnswers[`${rootState.user.id}`],
          )
          : new UserStudyEvaluatorAnswer({
            userDocId: rootState.user.id,
            preTestAnswer: (() => {
              const preTestAnswer = [];
              const preTestLength = rootState.test.testStructure.preTest?.length || 0;
              for (let i = 0; i < preTestLength; i++) {
                preTestAnswer[i] = {
                  preTestAnswerId: i,
                  answer: '',
                };
              }
              return preTestAnswer;
            })(),
            consent: rootState.test.testStructure.consent || false,
            postTestAnswer: rootState.test.testStructure.postTest || [],
            preTestCompleted: false,
            consentCompleted: false,
            fullName: '',
            postTestCompleted: false,
            tasks: (() => {
              const tasks = {};
              // Ensure userTasks exists before accessing its length
              const userTasksLength = rootState.test.testStructure.userTasks?.length || 0;
              for (let i = 0; i < userTasksLength; i++) {
                tasks[i] = new TaskAnswer({
                  taskId: i
                });
              }
              return tasks;
            })(),
          });
      }

      return {};
    },
    visibleUserAnswers(state) {
      if (!state.testAnswerDocument) return {};

      const doc = state.testAnswerDocument;

      if (doc.type === STUDY_TYPES.USER && doc.taskAnswers) {
        return Object.fromEntries(
          Object.entries(doc.taskAnswers).filter(
            ([, answer]) => answer.hidden === false
          )
        );
      }

      return {};
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
    SET_PRETEST_COMPLETED(state, { userId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]) {
        state.testAnswerDocument.taskAnswers[userId].preTestCompleted = value;
      }
    },
    SET_POSTTEST_COMPLETED(state, { userId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]) {
        state.testAnswerDocument.taskAnswers[userId].postTestCompleted = value;
      }
    },
    SET_CONSENT_COMPLETED(state, { userId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]) {
        state.testAnswerDocument.taskAnswers[userId].consentCompleted = value;
      }
    },
    SET_TASK_COMPLETED(state, { userId, taskId, value }) {
      if (
        state.testAnswerDocument?.taskAnswers?.[userId]?.tasks?.[taskId]
      ) {
        state.testAnswerDocument.taskAnswers[userId].tasks[taskId].completed = value;
      }
    }
  },
  actions: {
    async getCurrentTestAnswerDoc({ commit, rootState }) {
      const currentTest = rootState.Tests.Test
      if (!currentTest || !currentTest.answersDocId) {
        return
      }
      const currentAnswerDocId = currentTest.answersDocId
      commit('setLoading', true)
      try {
        const answerDoc = await answerController.getAnswerById(
          currentAnswerDocId,
        )
        commit('SET_ANSWER_DOCUMENT', answerDoc)
      } catch (e) {
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
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async saveTestAnswer({ commit }, payload) {
      commit('setLoading', true)
      try {
        await answerController.saveTestAnswer(
          payload.data,
          payload.answerDocId,
          payload.testType,
        )
      } catch (e) {
        console.error('Error in save test answer', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },
    async updateTaskAnswer({ commit }, { payload, answerDocId }) {
      commit('setLoading', true)
      try {
        await answerController.updateTaskAnswer(payload, answerDocId);
      } catch (e) {
        console.error('Error in save test answer', e)
      } finally {
        commit('setLoading', false)
      }
    },
    async processStatistics({ commit }, payload) {
      const table = {
        header: [],
        items: [],
      }

      table.header = [
        {
          title: 'Evaluator',
          align: 'start',
          sortable: false,
          value: 'evaluator',
        },
        {
          title: 'Usability Percentage',
          value: 'result',
          align: 'center',
        },
        {
          title: 'Applicable Question(s)',
          value: 'aplication',
          align: 'center',
        },
        {
          title: 'No Applicable Question(s)',
          value: 'noAplication',
          align: 'center',
        },
        {
          title: 'Conclusion Percentage',
          value: 'answered',
          align: 'center',
        },
        { title: 'Last Update', value: 'lastUpdate', align: 'center' },
      ]

      if (payload.resultEvaluator) {
        let evaluatorIndex = 1
        payload.resultEvaluator.forEach((evaluator) => {
          evaluator.id = `Ev${evaluatorIndex}`
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
            lastUpdate: new Date(evaluator.lastUpdate).toLocaleString(),
          })
          evaluatorIndex++
        })
      }

      commit('SET_EVALUATOR_STATISTICS', table)
    },
  },
}
