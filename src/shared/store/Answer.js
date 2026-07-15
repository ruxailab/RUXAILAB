import AnswerController from '@/shared/controllers/AnswerController'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'
import { percentage } from '@/ux/Heuristic/utils/statistics'
import { formatTimeSpentFromMs } from '@/ux/Heuristic/utils/statistics'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'
import CardSortingEvaluatorAnswer from '@/ux/CardSorting/models/CardSortingEvaluatorAnswer'
import { showError } from '@/shared/utils/toast'

const answerController = new AnswerController()

const isPermissionDenied = (error) =>
  error?.code === 'permission-denied' ||
  error?.message?.includes('PERMISSION_DENIED')

export default {
  state: {
    testAnswerDocument: null,
    answers: [],
    evaluatorStatistics: [],
    finalReport: [],
    mediaUrls: {},
  },
  getters: {
    mediaUrls(state) {
      return state.mediaUrls
    },
    testAnswerDocument(state, rootState) {
      if (!state.testAnswerDocument) {
        return null
      }

      // Return a transformed copy to avoid mutating state inside getter
      if (rootState.test && state.testAnswerDocument.heuristicAnswers) {
        const testOptions = rootState.test.testOptions

        // Create a shallow copy with transformed heuristicAnswers
        const transformedDoc = {
          ...state.testAnswerDocument,
          heuristicAnswers: {},
        }

        for (const [key, value] of Object.entries(
          state.testAnswerDocument.heuristicAnswers,
        )) {
          transformedDoc.heuristicAnswers[key] = {
            ...value,
            heuristicQuestions: value.heuristicQuestions.map((heuristic) => ({
              ...heuristic,
              heuristicQuestions: heuristic.heuristicQuestions.map(
                (question) => ({
                  ...question,
                  heuristicAnswer: question.heuristicAnswer?.text
                    ? question.heuristicAnswer
                    : {
                        text:
                          testOptions?.find(
                            (op) => op.value === question.heuristicAnswer,
                          )?.text ?? '',
                        value: question.heuristicAnswer,
                      },
                }),
              ),
            })),
          }
        }

        return transformedDoc
      }

      return state.testAnswerDocument
    },
    currentUserTestAnswer(state, rootState) {
      if (!state.testAnswerDocument) {
        return {}
      }

      // Guard against undefined rootState.test or rootState.test.testStructure
      if (!rootState.test || !rootState.test.testStructure) {
        return {}
      }
      if (!rootState.user) {
        return {}
      }

      if (state.testAnswerDocument.type === STUDY_TYPES.HEURISTIC) {
        const heuristicAnswers = state.testAnswerDocument.heuristicAnswers || {}

        const userAnswer = heuristicAnswers[rootState.user.id]
        if (userAnswer) {
          const transformedAnswer = HeuristicAnswer.toHeuristicAnswer(
            userAnswer,
            rootState.test.testOptions,
          )
          // Ensure the answer has testStarted flag
          if (
            !transformedAnswer.testStarted &&
            (transformedAnswer.progress > 0 ||
              transformedAnswer.lastViewedHeuristicIndex !== undefined)
          ) {
            transformedAnswer.testStarted = true
          }
          return transformedAnswer
        } else {
          return new HeuristicAnswer({
            userDocId: rootState.user.id,
            testStarted: false,
          })
        }
      }

      if (state.testAnswerDocument.type === STUDY_TYPES.USER) {
        const taskAnswers = state.testAnswerDocument.taskAnswers || {}

        return taskAnswers[rootState.user.id]
          ? UserStudyEvaluatorAnswer.toModel(taskAnswers[rootState.user.id])
          : new UserStudyEvaluatorAnswer({
              userDocId: rootState.user.id,
              preTestAnswer: (() => {
                const preTestAnswer = []
                const preTestLength =
                  rootState.test.testStructure.preTest?.length || 0
                for (let i = 0; i < preTestLength; i++) {
                  preTestAnswer[i] = {
                    preTestAnswerId: i,
                    answer: '',
                  }
                }
                return preTestAnswer
              })(),
              consent: rootState.test.testStructure.consent || false,
              postTestAnswer: rootState.test.testStructure.postTest || [],
              preTestCompleted: false,
              consentCompleted: false,
              fullName: '',
              postTestCompleted: false,
              tasks: (() => {
                const tasks = {}
                const userTasksLength =
                  rootState.test.testStructure.userTasks?.length || 0
                for (let i = 0; i < userTasksLength; i++) {
                  tasks[i] = new TaskAnswer({ taskId: i })
                }
                return tasks
              })(),
            })
      }

      return {}
    },
    visibleUserAnswers(state) {
      if (!state.testAnswerDocument) return {}

      const doc = state.testAnswerDocument

      if (doc.type === STUDY_TYPES.USER && doc.taskAnswers) {
        return Object.fromEntries(
          Object.entries(doc.taskAnswers).filter(
            ([, answer]) => answer.hidden !== true,
          ),
        )
      }

      return {}
    },
    allAnswersList(state) {
      const doc = state.testAnswerDocument
      if (!doc?.taskAnswers) return []
      return Object.values(doc.taskAnswers).filter(
        (answer) =>
          typeof answer === 'object' &&
          answer !== null &&
          answer.hidden !== true,
      )
    },
    currentCardSortingAnswer(state, rootGetters) {
      if (!state.testAnswerDocument) return {}
      if (!rootGetters.test || !rootGetters.user) return {}

      const cardSortingAnswers =
        state.testAnswerDocument.cardSortingAnswers || {}
      const existing = cardSortingAnswers[rootGetters.user.id]

      return existing
        ? CardSortingEvaluatorAnswer.toModel(existing)
        : new CardSortingEvaluatorAnswer({ userDocId: rootGetters.user.id })
    },
    cardSortingAnswersList(state) {
      const doc = state.testAnswerDocument
      if (!doc?.cardSortingAnswers) return []
      return Object.values(doc.cardSortingAnswers).filter(
        (answer) =>
          typeof answer === 'object' &&
          answer !== null &&
          answer.hidden !== true,
      )
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
        state.testAnswerDocument.taskAnswers[userId].preTestCompleted = value
      }
    },
    SET_POSTTEST_COMPLETED(state, { userId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]) {
        state.testAnswerDocument.taskAnswers[userId].postTestCompleted = value
      }
    },
    SET_CONSENT_COMPLETED(state, { userId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]) {
        state.testAnswerDocument.taskAnswers[userId].consentCompleted = value
      }
    },
    SET_TASK_COMPLETED(state, { userId, taskId, value }) {
      if (state.testAnswerDocument?.taskAnswers?.[userId]?.tasks?.[taskId]) {
        state.testAnswerDocument.taskAnswers[userId].tasks[taskId].completed =
          value
      }
    },
    SET_TASK_MEDIA_URL(state, { taskIndex, mediaType, url, size, userId }) {
      const currentTaskMedia = state.mediaUrls[taskIndex] || {}

      // Update media URL
      const updatedTaskMedia = {
        ...currentTaskMedia,
        [mediaType]: url,
      }

      if (size) {
        if (!updatedTaskMedia.sizes) updatedTaskMedia.sizes = {}
        updatedTaskMedia.sizes[mediaType] = size

        if (
          userId &&
          state.testAnswerDocument?.taskAnswers?.[userId]?.tasks?.[taskIndex]
        ) {
          const task =
            state.testAnswerDocument.taskAnswers[userId].tasks[taskIndex]

          if (mediaType === 'screenRecordURL') {
            task.screenSize = size
          } else if (mediaType === 'audioRecordURL') {
            task.audioSize = size
          } else if (mediaType === 'webcamRecordURL') task.webcamSize = size
        } else {
          console.warn(
            '[Mutation] Could not find task document to update size',
            { userId, taskIndex },
          )
        }
      }
      state.mediaUrls[taskIndex] = updatedTaskMedia
    },
    SET_TOAST(state, payload) {
      if (!state.toast) state.toast = {}
      state.toast = payload
    },
  },
  actions: {
    async getCurrentTestAnswerDoc({ commit, rootState }) {
      const currentTest = rootState.Tests.Test
      if (!currentTest || !currentTest.answersDocId) {
        return
      }
      const currentAnswersDocId = currentTest.answersDocId
      commit('setLoading', true)
      try {
        const answerDoc =
          await answerController.getAnswerById(currentAnswersDocId)
        commit('SET_ANSWER_DOCUMENT', answerDoc)
      } catch (error) {
        if (isPermissionDenied(error) && currentTest.id) {
          try {
            const answerDoc = await answerController.getMyStudyAnswer(
              currentTest.id,
            )
            commit('SET_ANSWER_DOCUMENT', answerDoc)
            return
          } catch (fallbackError) {
            console.error(
              '[Answer Store] Failed to fetch own answer document:',
              fallbackError,
            )
          }
        } else {
          console.error(
            '[Answer Store] Failed to fetch answer document:',
            error,
          )
        }
        showError('errors.failedToLoadAnswers')
      } finally {
        commit('setLoading', false)
      }
    },
    async updateUserAnswer({ commit }, payload) {
      commit('setLoading', true)
      try {
        await answerController.updateUserAnswer(payload)
      } catch (error) {
        console.error('[Answer Store] Failed to update user answer:', error)
        throw error
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
        console.error('[Answer Store] Failed to remove cooperator:', e)
        showError('errors.failedToRemoveCooperator')
      } finally {
        commit('setLoading', false)
      }
    },
    async saveTestAnswer({ commit, state, rootState }, payload) {
      commit('setLoading', true)
      try {
        await answerController.saveTestAnswer(
          payload.data,
          payload.answersDocId,
          payload.testType,
        )

        // Update the local state to reflect saved changes
        if (state.testAnswerDocument && rootState.user) {
          const userId = rootState.user.id
          if (payload.testType === STUDY_TYPES.HEURISTIC) {
            if (!state.testAnswerDocument.heuristicAnswers) {
              state.testAnswerDocument.heuristicAnswers = {}
            }
            state.testAnswerDocument.heuristicAnswers[userId] = payload.data
          } else if (payload.testType === STUDY_TYPES.USER) {
            if (!state.testAnswerDocument.taskAnswers) {
              state.testAnswerDocument.taskAnswers = {}
            }
            state.testAnswerDocument.taskAnswers[userId] = payload.data
          } else if (payload.testType === STUDY_TYPES.CARD_SORTING) {
            if (!state.testAnswerDocument.cardSortingAnswers) {
              state.testAnswerDocument.cardSortingAnswers = {}
            }
            state.testAnswerDocument.cardSortingAnswers[userId] = payload.data
          }
        }

        // Show success toast if message provided
        if (payload.successMessage) {
          commit('SET_TOAST', {
            type: 'success',
            message: payload.successMessage,
            show: true,
          })
        }
      } catch (e) {
        console.error('[Answer Store] Failed to save test answer:', e)
        if (payload.errorMessage) {
          commit('SET_TOAST', {
            type: 'error',
            message: payload.errorMessage,
            show: true,
          })
        }
      } finally {
        commit('setLoading', false)
      }
    },
    async updateTaskAnswer({ commit }, { payload, answersDocId }) {
      commit('setLoading', true)
      try {
        await answerController.updateTaskAnswer(payload, answersDocId)
      } catch (error) {
        console.error('[Answer Store] Failed to update task answer:', error)
        showError('errors.failedToUpdateAnswer')
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
        { title: 'Total Time', value: 'totalTime', align: 'center' },
        { title: 'Last Update', value: 'lastUpdate', align: 'center' },
      ]

      if (payload.resultEvaluator) {
        let evaluatorIndex = 1
        payload.resultEvaluator.forEach((evaluator) => {
          evaluator.id = `Ev${evaluatorIndex}`
          let totalNoAplication = 0
          let totalNoReply = 0
          let totalQuestionsValues = 0
          let totalTimeMs = 0

          evaluator.heuristics.forEach((heuristic) => {
            totalNoAplication += heuristic.totalNoAplication
            totalNoReply += heuristic.totalNoReply
            totalQuestionsValues += heuristic.totalQuestionsValues
            totalTimeMs += Number(heuristic.timeSpentMs || 0)
          })

          table.items.push({
            evaluator: evaluator.id,
            result: evaluator.result,
            aplication: totalQuestionsValues - totalNoAplication,
            noAplication: totalNoAplication,
            answered: percentage(
              totalQuestionsValues - totalNoReply,
              totalQuestionsValues,
            ).toFixed(2),
            totalTime: formatTimeSpentFromMs(totalTimeMs),
            lastUpdate: new Date(evaluator.lastUpdate).toLocaleString(),
          })
          evaluatorIndex++
        })
      }

      commit('SET_EVALUATOR_STATISTICS', table)
    },

    async updateTaskMediaUrl(
      { commit, rootState },
      { taskIndex, mediaType, url, size },
    ) {
      const userId = rootState.user?.id
      await commit('SET_TASK_MEDIA_URL', {
        taskIndex,
        mediaType,
        url,
        size,
        userId,
      })
    },
  },
}
