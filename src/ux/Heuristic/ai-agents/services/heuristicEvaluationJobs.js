import { HeuristicEvaluationRunner } from './HeuristicEvaluationRunner'
import HeuristicPageLoader from './HeuristicPageLoader'
import FirebaseHeuristicAgentProvider from './FirebaseHeuristicAgentProvider'
import AnswerController from '@/shared/controllers/AnswerController'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'

const loader = new HeuristicPageLoader()
const answers = new AnswerController()
export default new HeuristicEvaluationRunner({
  loadPage: (url, testId) => loader.load(url, testId),
  createProvider: (testId, agentId) =>
    new FirebaseHeuristicAgentProvider({ testId, agentId }),
  saveAnswer: (answer, answersDocId) =>
    answers.saveTestAnswer(answer, answersDocId, STUDY_TYPES.HEURISTIC),
})
