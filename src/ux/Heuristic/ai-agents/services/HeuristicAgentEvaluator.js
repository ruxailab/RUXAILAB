import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'
import Heuristic from '@/ux/Heuristic/models/Heuristic'
import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'
import {
  HEURISTIC_ANSWER_MODE,
  buildCanonicalHeuristicAnswer,
  resolveHeuristicAnswerMode,
} from '@/ux/Heuristic/utils/heuristicAnswerMode'

const flattenQuestions = (testStructure) =>
  testStructure.flatMap((heuristic, heuristicIndex) =>
    (heuristic.questions || []).map((question, questionIndex) => ({
      heuristicIndex,
      questionIndex,
      heuristicId: heuristic.id ?? heuristicIndex,
      heuristicTitle: heuristic.title || heuristic.name || '',
      questionId: question.id ?? questionIndex,
      question: question.title || question.text || '',
      descriptions: question.descriptions || [],
    })),
  )

const reportProgress = (onProgress, index, total, status) => {
  if (typeof onProgress !== 'function') return
  onProgress({ index: index + 1, total, status })
}

const collectDecisions = async ({
  provider,
  agent,
  test,
  webTree,
  questions,
  answerMode,
  onProgress,
}) => {
  const decisions = []
  const heuristics = test.testStructure || []
  for (let index = 0; index < heuristics.length; index += 1) {
    const heuristicQuestions = questions.filter(
      (question) => question.heuristicIndex === index,
    )
    if (!heuristicQuestions.length) continue

    reportProgress(onProgress, index, heuristics.length, 'running')
    const result = await provider.evaluate({
      agent: agent.toFirestore(),
      page: webTree,
      questions: heuristicQuestions,
      options: test.testOptions || [],
      answerMode,
      responseSchema: {
        type: 'array',
        items: ['heuristicId', 'questionId', 'answer', 'comment', 'evidence'],
      },
    })
    if (!Array.isArray(result)) {
      throw new TypeError('AI provider returned an invalid response.')
    }
    decisions.push(...result)
    reportProgress(onProgress, index, heuristics.length, 'completed')
  }
  return decisions
}

const buildQuestionAnswer = ({
  question,
  questionIndex,
  heuristic,
  heuristicIndex,
  decisions,
  answerMode,
  options,
  now,
}) => {
  const heuristicId = heuristic.id ?? heuristicIndex
  const questionId = question.id ?? questionIndex
  const decision = decisions.get(`${heuristicId}:${questionId}`)
  if (!decision) {
    throw new Error(
      `AI response is missing question ${heuristicId}:${questionId}.`,
    )
  }

  const matchedOption =
    answerMode === HEURISTIC_ANSWER_MODE.CUSTOM_OPTIONS
      ? options.find((option) => option.value === decision.answer)
      : null
  const answer = buildCanonicalHeuristicAnswer({
    mode: answerMode,
    option: matchedOption,
    frequency: decision.frequency,
    severity: decision.severity,
  })
  if (
    answer?.value == null ||
    (answerMode === HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY &&
      (answer.frequency == null || answer.severity == null))
  ) {
    throw new Error(`AI returned no answer for ${heuristicId}:${questionId}.`)
  }

  const evidence = Array.isArray(decision.evidence)
    ? decision.evidence.filter(Boolean).join('\n')
    : decision.evidence
  const comment = [decision.comment, evidence].filter(Boolean).join('\n\n')
  const comments = comment
    ? [
        {
          id: `ai-${heuristicId}-${questionId}`,
          text: comment,
          createdAt: now(),
        },
      ]
    : []
  return new HeuristicQuestionAnswer({
    heuristicId: questionId,
    heuristicAnswer: answer,
    heuristicComment: comment,
    comments,
  })
}

const buildHeuristicAnswers = (test, decisions, answerMode, now) =>
  test.testStructure.map((heuristic, heuristicIndex) => {
    const answers = (heuristic.questions || []).map((question, questionIndex) =>
      buildQuestionAnswer({
        question,
        questionIndex,
        heuristic,
        heuristicIndex,
        decisions,
        answerMode,
        options: test.testOptions || [],
        now,
      }),
    )
    return new Heuristic({
      heuristicId: heuristic.id ?? heuristicIndex,
      heuristicTitle: heuristic.title || heuristic.name || '',
      heuristicQuestions: answers,
      heuristicTotal: answers.length,
      timeSpent: '00:00',
    })
  })

/** Turns a provider's structured decisions into the normal human evaluator format. */
export default class HeuristicAgentEvaluator {
  constructor({ provider, saveAnswer = null, now = () => Date.now() } = {}) {
    if (!provider || typeof provider.evaluate !== 'function') {
      throw new TypeError('The AI provider must implement evaluate(context).')
    }
    this.provider = provider
    this.saveAnswer = saveAnswer
    this.now = now
  }

  async evaluate({
    agent,
    userId,
    test,
    webTree,
    onProgress = null,
    answerId = null,
  }) {
    if (!agent?.canBeUsedBy(userId))
      throw new Error('User cannot use this agent.')
    if (!test?.testStructure?.length)
      throw new Error('The test has no heuristics.')
    if (!webTree?.root) throw new Error('A web tree is required.')

    const questions = flattenQuestions(test.testStructure)
    const answerMode = resolveHeuristicAnswerMode(test)
    if (!answerMode)
      throw new Error('The test has no configured answer mechanism.')
    const decisions = await collectDecisions({
      provider: this.provider,
      agent,
      test,
      webTree,
      questions,
      answerMode,
      onProgress,
    })

    const byQuestion = new Map(
      decisions.map((item) => [`${item.heuristicId}:${item.questionId}`, item]),
    )
    const heuristicQuestions = buildHeuristicAnswers(
      test,
      byQuestion,
      answerMode,
      this.now,
    )

    return new HeuristicAnswer({
      heuristicQuestions,
      progress: 100,
      total: questions.length,
      submitted: true,
      userDocId:
        answerId || `ai-agent:${encodeURIComponent(agent.id || agent.name)}`,
      lastUpdate: this.now(),
    })
  }

  /** Evaluate and persist through an injected callback (store action, API or repository). */
  async evaluateAndSave(context) {
    if (typeof this.saveAnswer !== 'function') {
      throw new TypeError(
        'A saveAnswer callback is required to persist the evaluation.',
      )
    }
    const answer = await this.evaluate(context)
    await this.saveAnswer(answer, context)
    return answer
  }
}
