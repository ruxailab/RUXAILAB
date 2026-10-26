import { prepareAgentStudy } from '@/ux/Heuristic/utils/heuristicAgentStudyMode'
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

// Match the server's four-question batches and overlap at most two requests.
const evaluateHeuristicBatches = async ({
  provider,
  context,
  test,
  heuristicIndex,
  beforeHeuristic,
  onQuestionProgress,
  onQuestionError,
  now,
}) => {
  const batches = []
  for (let start = 0; start < context.questions.length; start += 4) {
    batches.push(context.questions.slice(start, start + 4))
  }
  const results = new Array(batches.length)
  let next = 0
  let completed = 0
  let failure = null
  const worker = async () => {
    while (!failure && next < batches.length) {
      const batchIndex = next++
      try {
        if (beforeHeuristic) await beforeHeuristic(heuristicIndex)
        if (failure) return
        const questions = batches[batchIndex]
        const validate = (result, questions) => {
          if (!Array.isArray(result))
            throw new TypeError('AI provider returned an invalid response.')
          const byQuestion = new Map(
            result.map((item) => [
              `${item.heuristicId}:${item.questionId}`,
              item,
            ]),
          )
          for (const question of questions) {
            buildQuestionAnswer({
              question:
                test.testStructure[heuristicIndex].questions[
                  question.questionIndex
                ],
              questionIndex: question.questionIndex,
              heuristic: test.testStructure[heuristicIndex],
              heuristicIndex,
              decisions: byQuestion,
              answerMode: context.answerMode,
              options: context.options,
              now,
            })
          }
        }
        const request = async (questions) => {
          const result = await provider.evaluate({ ...context, questions })
          validate(result, questions)
          return result
        }
        let result
        try {
          result = await provider.evaluate({ ...context, questions })
          validate(result, questions)
        } catch (batchError) {
          if (!onQuestionError) throw batchError
          const partial = Array.isArray(result) ? result : []
          result = []
          for (const question of questions) {
            const existing = partial.filter(
              (decision) =>
                decision.heuristicId === question.heuristicId &&
                decision.questionId === question.questionId,
            )
            try {
              validate(existing, [question])
              result.push(...existing)
              continue
            } catch {
              // Retain valid answers; expose only failed questions for retry.
            }
            let error = batchError
            while (true) {
              const recovered = await onQuestionError({
                index: heuristicIndex,
                questionIndex: question.questionIndex,
                error,
              })
              if (beforeHeuristic) await beforeHeuristic(heuristicIndex)
              try {
                result.push(...(await request([question])))
                recovered?.()
                break
              } catch (retryError) {
                error = retryError
              }
            }
          }
        }
        results[batchIndex] = result
        completed += questions.length
        onQuestionProgress?.({
          index: heuristicIndex,
          completed,
          total: context.questions.length,
        })
      } catch (error) {
        failure ||= error
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, batches.length) }, worker))
  if (failure) throw failure
  return results.flat()
}

const collectDecisions = async ({
  provider,
  agent,
  test,
  webTree,
  questions,
  answerMode,
  onProgress,
  beforeHeuristic,
  onHeuristicCompleted,
  onQuestionProgress,
  onQuestionError,
  now,
}) => {
  const decisions = []
  const heuristics = test.testStructure || []
  for (let index = 0; index < heuristics.length; index += 1) {
    const heuristicQuestions = questions.filter(
      (question) => question.heuristicIndex === index,
    )
    if (beforeHeuristic) await beforeHeuristic(index)
    if (!heuristicQuestions.length) {
      if (onHeuristicCompleted)
        await onHeuristicCompleted(
          index,
          buildHeuristicAnswers(
            { ...test, testStructure: [heuristics[index]] },
            new Map(),
            answerMode,
            now,
            index,
          )[0],
        )
      reportProgress(onProgress, index, heuristics.length, 'completed')
      continue
    }

    reportProgress(onProgress, index, heuristics.length, 'running')
    const result = await evaluateHeuristicBatches({
      provider,
      test,
      heuristicIndex: index,
      beforeHeuristic,
      onQuestionProgress,
      onQuestionError,
      now,
      context: {
        agent: agent.toFirestore(),
        page: webTree,
        questions: heuristicQuestions,
        options:
          answerMode === HEURISTIC_ANSWER_MODE.CUSTOM_OPTIONS
            ? test.testOptions || []
            : [],
        answerMode,
        studyMode: test.studyMode,
        heuristics: test.testStructure.map((h, index) => ({
          id: h.id ?? index,
          title: h.title || h.name || '',
          description: h.description || '',
          descriptions: h.descriptions || [],
        })),
        responseSchema: {
          type: 'array',
          items: ['heuristicId', 'questionId', 'answer', 'comment', 'evidence'],
        },
      },
    })
    if (!Array.isArray(result)) {
      throw new TypeError('AI provider returned an invalid response.')
    }
    // Validate each response before reporting this heuristic as completed.
    const [answer] = buildHeuristicAnswers(
      { ...test, testStructure: [heuristics[index]] },
      new Map(
        result.map((item) => [`${item.heuristicId}:${item.questionId}`, item]),
      ),
      answerMode,
      now,
      index,
    )
    if (onHeuristicCompleted) await onHeuristicCompleted(index, answer)
    decisions.push(...result)
    // A pause during the request takes effect before advancing to the next one.
    if (beforeHeuristic) await beforeHeuristic(index)
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
  const validMetric = (value) =>
    Number.isInteger(value) && value >= 0 && value <= 4
  if (
    ([
      HEURISTIC_ANSWER_MODE.FREQUENCY,
      HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY,
    ].includes(answerMode) &&
      !validMetric(decision.frequency)) ||
    ([
      HEURISTIC_ANSWER_MODE.SEVERITY,
      HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY,
    ].includes(answerMode) &&
      !validMetric(decision.severity))
  ) {
    throw new Error(
      `AI returned an invalid metric for ${heuristicId}:${questionId}.`,
    )
  }
  if (
    answerMode === HEURISTIC_ANSWER_MODE.WEIGHT &&
    (!Number.isInteger(decision.weight) ||
      decision.weight < 1 ||
      decision.weight > 9)
  ) {
    throw new Error(
      `AI returned an invalid weight for ${heuristicId}:${questionId}.`,
    )
  }
  const answer = buildCanonicalHeuristicAnswer({
    mode: answerMode,
    option: matchedOption,
    frequency: decision.frequency,
    severity: decision.severity,
    weight: decision.weight,
  })
  if (
    answer?.value == null ||
    (answerMode === HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY &&
      (answer.frequency == null || answer.severity == null))
  ) {
    throw new Error(`AI returned no answer for ${heuristicId}:${questionId}.`)
  }

  const comment = decision.comment || ''
  const comments = comment
    ? [
        {
          id: `ai-${heuristicId}-${questionId}`,
          text: comment,
          createdAt: now(),
        },
      ]
    : []
  const screenshot = decision.screenshot
  const images = screenshot?.url
    ? [
        {
          id: `ai-screenshot-${heuristicId}-${questionId}`,
          url: screenshot.url,
          createdAt: screenshot.createdAt || now(),
        },
      ]
    : []
  return new HeuristicQuestionAnswer({
    heuristicId: questionId,
    heuristicAnswer: answer,
    heuristicComment: comment,
    answerImageUrl: images[0]?.url || '',
    comments,
    images,
  })
}

const buildHeuristicAnswers = (test, decisions, answerMode, now, offset = 0) =>
  test.testStructure.map((heuristic, heuristicIndex) => {
    const answers = (heuristic.questions || []).map((question, questionIndex) =>
      buildQuestionAnswer({
        question,
        questionIndex,
        heuristic,
        heuristicIndex: heuristicIndex + offset,
        decisions,
        answerMode,
        options: test.testOptions || [],
        now,
      }),
    )
    return new Heuristic({
      heuristicId: heuristic.id ?? heuristicIndex + offset,
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
    beforeHeuristic = null,
    onHeuristicCompleted = null,
    onQuestionProgress = null,
    onQuestionError = null,
    answerId = null,
  }) {
    test = prepareAgentStudy(test)
    const startedAt = this.now()
    if (!agent?.canBeUsedBy(userId))
      throw new Error('User cannot use this agent.')
    if (!test?.testStructure?.length)
      throw new Error('The test has no heuristics.')
    if (!webTree?.root) throw new Error('A web tree is required.')

    const questions = flattenQuestions(test.testStructure)
    const answerMode = test.useWeights
      ? HEURISTIC_ANSWER_MODE.WEIGHT
      : resolveHeuristicAnswerMode(test)
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
      beforeHeuristic,
      onHeuristicCompleted,
      onQuestionProgress,
      onQuestionError,
      now: this.now,
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
      evaluationTimeMs: Math.max(0, this.now() - startedAt),
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
