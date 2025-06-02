import AnswerController from '@/controllers/AnswerController'
import HeuristicAnswer from '@/models/HeuristicAnswer'
import TaskAnswer from '@/models/TaskAnswer'
import UserTask from '@/models/UserTask'
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

      if (state.testAnswerDocument.type === 'HEURISTICS') {
        return state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`]
          ? HeuristicAnswer.toHeuristicAnswer(
              state.testAnswerDocument.heuristicAnswers[`${rootState.user.id}`],
              rootState.test.testOptions,
            )
          : new HeuristicAnswer({
              userDocId: rootState.user.id,
            });
      }

      if (state.testAnswerDocument.type === 'User') {
        return state.testAnswerDocument.taskAnswers[`${rootState.user.id}`]
          ? TaskAnswer.toTaskAnswer(
              state.testAnswerDocument.taskAnswers[`${rootState.user.id}`],
            )
          : new TaskAnswer({
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
                  tasks[i] = new UserTask({
                    taskId: i,
                    taskAnswer: '',
                    taskObservations: '',
                    taskTime: null,
                    completed: null,
                    audioRecordURL: '',
                    screenRecordURL: '',
                    webcamRecordURL: '',
                    postAnswer: '',
                  });
                }
                return tasks;
              })(),
            });
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
