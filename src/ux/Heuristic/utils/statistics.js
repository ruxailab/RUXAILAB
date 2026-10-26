import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import store from '@/store'

const EMPTY_PERCENTAGE = '0.00'
const HEURISTICS_HEADER = {
  title: 'HEURISTICS',
  align: 'start',
  sortable: false,
}

function createEmptySummary() {
  return {
    average: null,
    max: null,
    min: null,
    sd: null,
    avrgWarning: null,
    avrgmaxWarning: null,
    avrgminWarning: null,
    impactWarning: null,
    evaluators: 0,
    totalComments: 0,
    totalImages: 0,
  }
}

function createEmptyFinalResult() {
  return {
    result: EMPTY_PERCENTAGE,
    baseWarning: EMPTY_PERCENTAGE,
    maxWarning: EMPTY_PERCENTAGE,
    minWarning: EMPTY_PERCENTAGE,
    maxPerfResultWarnings: 0,
    totalWarnings: 0,
  }
}

function toFiniteNumber(value, fallback = 0) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

function toNumericScore(value) {
  const parsed = parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : NaN
}

function formatPercentage(value) {
  return `${toFiniteNumber(value).toFixed(2)}%`
}

function safeDivide(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator
}

function percentage(value, result) {
  return safeDivide(value * 100, result)
}

function standardDeviation(values) {
  if (!Array.isArray(values) || values.length === 0) return 0

  const average =
    values.reduce((total, value) => total + value, 0) / values.length
  const variance =
    values.reduce((total, value) => total + (average - value) ** 2, 0) /
    values.length

  return Math.sqrt(variance)
}

function parseTimeSpentToMs(timeSpent) {
  if (typeof timeSpent !== 'string') return 0

  const [minutes = '0', seconds = '0'] = timeSpent.split(':')
  const min = toFiniteNumber(minutes)
  const sec = toFiniteNumber(seconds)

  return (Math.max(0, min) * 60 + Math.max(0, sec)) * 1000
}

function formatTimeSpentFromMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(toFiniteNumber(ms) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getTestOptionBounds(testOptions = []) {
  const optionValues = Array.isArray(testOptions)
    ? testOptions
        .map((item) => toFiniteNumber(item?.value, NaN))
        .filter((value) => Number.isFinite(value))
    : []

  if (!optionValues.length) {
    return { maxOption: 0, minOption: 0 }
  }

  return {
    maxOption: Math.max(...optionValues),
    minOption: Math.min(...optionValues),
  }
}

function getQuestionImages(question) {
  if (Array.isArray(question?.images)) return question.images
  if (Array.isArray(question?.heuristicAnswer?.images)) {
    return question.heuristicAnswer.images
  }
  return []
}

function hasLegacyImage(question) {
  return Boolean(
    question?.answerImageUrl?.trim() ||
    question?.heuristicAnswer?.answerImageUrl?.trim(),
  )
}

function getQuestionComments(question) {
  const answer = question?.heuristicAnswer || {}
  const comments = []

  if (Array.isArray(question?.comments)) {
    comments.push(...question.comments)
  }

  if (Array.isArray(answer.comments)) {
    comments.push(...answer.comments)
  }

  const validComments = comments.filter((comment) => {
    if (typeof comment === 'string') return comment.trim() !== ''
    return String(comment?.text || '').trim() !== ''
  })

  if (validComments.length > 0) return validComments

  const legacyComment =
    question?.heuristicComment || answer?.heuristicComment || ''

  return legacyComment.trim() ? [{ id: 'legacy', text: legacyComment }] : []
}

function isQuestionWithoutReply(answer) {
  return answer?.value == null || answer?.value === ''
}

function summarizeQuestion(question) {
  const answer = question?.heuristicAnswer || {}
  const warning = answer.warning === true
  const value =
    answer.value && typeof answer.value === 'object'
      ? toFiniteNumber(answer.severity)
      : toFiniteNumber(answer.value)
  const images = getQuestionImages(question)
  const comments = getQuestionComments(question)

  return {
    value,
    isWarning: warning,
    isNotApplicable: answer.value === null && !warning,
    isNoReply: isQuestionWithoutReply(answer),
    imageCount:
      images.length > 0 ? images.length : hasLegacyImage(question) ? 1 : 0,
    commentCount: comments.length,
  }
}

function summarizeHeuristic(heuristic, heuristicIndex) {
  const questions = Array.isArray(heuristic?.heuristicQuestions)
    ? heuristic.heuristicQuestions
    : []

  const questionSummary = questions.reduce(
    (summary, question) => {
      const current = summarizeQuestion(question)

      summary.result += current.value
      summary.totalNoAplication += current.isNotApplicable ? 1 : 0
      summary.totalNoReply += current.isNoReply ? 1 : 0
      summary.totalWarnings += current.isWarning ? 1 : 0
      summary.totalImages += current.imageCount
      summary.totalComments += current.commentCount

      return summary
    },
    {
      result: 0,
      totalNoAplication: 0,
      totalNoReply: 0,
      totalWarnings: 0,
      totalImages: 0,
      totalComments: 0,
    },
  )

  const allQuestionsAreNotApplicable =
    questions.length > 0 &&
    questionSummary.totalNoAplication === questions.length

  return {
    id: `H${heuristicIndex + 1}`,
    result: allQuestionsAreNotApplicable ? null : questionSummary.result,
    totalQuestionsValues: toFiniteNumber(heuristic?.heuristicTotal),
    totalNoAplication: questionSummary.totalNoAplication,
    totalNoReply: questionSummary.totalNoReply,
    totalWarnings: questionSummary.totalWarnings,
    totalImages: questionSummary.totalImages,
    totalComments: questionSummary.totalComments,
    timeSpentMs: parseTimeSpentToMs(heuristic?.timeSpent),
  }
}

function summarizeEvaluator(evaluator) {
  const heuristics = Array.isArray(evaluator?.heuristicQuestions)
    ? evaluator.heuristicQuestions.map((heuristic, index) =>
        summarizeHeuristic(heuristic, index),
      )
    : []

  return {
    userDocId: evaluator?.userDocId,
    id: evaluator?.userDocId,
    heuristics,
    totalComments: heuristics.reduce(
      (total, heuristic) => total + toFiniteNumber(heuristic.totalComments),
      0,
    ),
    totalImages: heuristics.reduce(
      (total, heuristic) => total + toFiniteNumber(heuristic.totalImages),
      0,
    ),
    result: 0,
    lastUpdate: toFiniteNumber(evaluator?.lastUpdate),
  }
}

function getStudyAnswers(
  testAnswerDocument = store.getters.testAnswerDocument,
) {
  if (!testAnswerDocument) return []

  if (testAnswerDocument.type === STUDY_TYPES.HEURISTIC) {
    return Object.values(testAnswerDocument.heuristicAnswers || {})
  }

  return Object.values(testAnswerDocument.taskAnswers || {})
}

function answers() {
  return getStudyAnswers()
}

function cloneSerializable(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return fallback
  }
}

function buildHeuristicTestBundlePayload({
  test = store.getters.test,
  testAnswerDocument = store.getters.testAnswerDocument,
  evaluatorItems = store.state.Answer.evaluatorStatistics?.items || [],
} = {}) {
  const safeTest = cloneSerializable(test, {})
  const safeAnswerDocument = cloneSerializable(testAnswerDocument, null)
  const answerList = getStudyAnswers(testAnswerDocument)

  return {
    meta: {
      capturedAt: new Date().toISOString(),
      source: 'heuristic-answer',
      testId: safeTest?.id || null,
      answersDocId: safeTest?.answersDocId || null,
      testType: safeTest?.testType || STUDY_TYPES.HEURISTIC,
    },
    test: safeTest,
    answerDocument: safeAnswerDocument,
    answers: cloneSerializable(answerList, []),
    statistics: {
      evaluators: cloneSerializable(statistics(), []),
      summary: cloneSerializable(
        finalResult(evaluatorItems),
        createEmptySummary(),
      ),
    },
  }
}

function downloadHeuristicTestBundlePayload(
  payload = buildHeuristicTestBundlePayload(),
  fileName,
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  const safeFileName =
    fileName ||
    `heuristic-test-bundle-${payload?.meta?.testId || 'unknown'}-${Date.now()}.json`
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = safeFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}

function calcFinalResult(
  heuristics,
  testOptions = store.getters.test?.testOptions,
) {
  if (!Array.isArray(testOptions)) {
    return createEmptyFinalResult()
  }

  const { maxOption, minOption } = getTestOptionBounds(testOptions)
  const totals = (Array.isArray(heuristics) ? heuristics : []).reduce(
    (summary, heuristic) => {
      const heuristicResult =
        heuristic?.result === null || heuristic?.result === -1
          ? 0
          : toFiniteNumber(heuristic?.result)
      const totalQuestions = toFiniteNumber(heuristic?.totalQuestionsValues)
      const totalNoAplication = toFiniteNumber(heuristic?.totalNoAplication)
      const totalWarnings = toFiniteNumber(heuristic?.totalWarnings)

      summary.result += heuristicResult
      summary.totalWarnings += totalWarnings
      summary.applicableQuestions += totalQuestions - totalNoAplication

      return summary
    },
    {
      result: 0,
      totalWarnings: 0,
      applicableQuestions: 0,
    },
  )

  const maxPerfectResult = totals.applicableQuestions * maxOption
  const maxPerfResultWarnings =
    (totals.applicableQuestions + totals.totalWarnings) * maxOption

  return {
    result: percentage(totals.result, maxPerfectResult).toFixed(2),
    baseWarning: percentage(totals.result, maxPerfResultWarnings).toFixed(2),
    maxWarning: percentage(
      totals.result + totals.totalWarnings * maxOption,
      maxPerfResultWarnings,
    ).toFixed(2),
    minWarning: percentage(
      totals.result + totals.totalWarnings * minOption,
      maxPerfResultWarnings,
    ).toFixed(2),
    maxPerfResultWarnings,
    totalWarnings: totals.totalWarnings,
  }
}

function statistics() {
  const test = store.getters.test
  const testAnswerDocument = store.getters.testAnswerDocument

  if (!test || !testAnswerDocument) {
    return []
  }

  return answers()
    .map((evaluator) => {
      const evaluatorSummary = summarizeEvaluator(evaluator)

      return {
        ...evaluatorSummary,
        ...calcFinalResult(evaluatorSummary.heuristics, test.testOptions),
      }
    })
    .sort((left, right) => right.lastUpdate - left.lastUpdate)
}

function finalResult(
  evaluatorItems = store.state.Answer.evaluatorStatistics?.items || [],
) {
  const validItems = Array.isArray(evaluatorItems)
    ? evaluatorItems.filter((item) =>
        Number.isFinite(toNumericScore(item.result)),
      )
    : []

  if (!validItems.length) {
    return createEmptySummary()
  }

  const resultValues = validItems.map((item) => toNumericScore(item.result))
  const baseWarningValues = validItems.map(
    (item) => toNumericScore(item.baseWarning) || 0,
  )
  const maxWarningValues = validItems.map(
    (item) => toNumericScore(item.maxWarning) || 0,
  )
  const minWarningValues = validItems.map(
    (item) => toNumericScore(item.minWarning) || 0,
  )

  const averageResult =
    resultValues.reduce((total, value) => total + value, 0) / validItems.length
  const averageBaseWarning =
    baseWarningValues.reduce((total, value) => total + value, 0) /
    validItems.length
  const averageMaxWarning =
    maxWarningValues.reduce((total, value) => total + value, 0) /
    validItems.length
  const averageMinWarning =
    minWarningValues.reduce((total, value) => total + value, 0) /
    validItems.length

  return {
    average: formatPercentage(averageResult),
    max: formatPercentage(Math.max(...resultValues)),
    min: formatPercentage(Math.min(...resultValues)),
    sd: formatPercentage(standardDeviation(resultValues)),
    avrgWarning: formatPercentage(averageBaseWarning),
    avrgmaxWarning: formatPercentage(averageMaxWarning),
    avrgminWarning: formatPercentage(averageMinWarning),
    impactWarning: formatPercentage(averageResult - averageBaseWarning),
    evaluators: validItems.length,
    totalComments: validItems.reduce(
      (total, item) => total + toFiniteNumber(item.totalComments),
      0,
    ),
    totalImages: validItems.reduce(
      (total, item) => total + toFiniteNumber(item.totalImages),
      0,
    ),
  }
}

function buildHeuristicsEvaluator(resultEvaluator, testOptions) {
  const table = {
    header: [
      {
        title: HEURISTICS_HEADER.title,
        align: HEURISTICS_HEADER.align,
        value: 'heuristic',
      },
    ],
    items: [],
  }

  if (!Array.isArray(resultEvaluator)) return table

  const { maxOption, minOption } = getTestOptionBounds(testOptions)
  const rowsByHeuristic = new Map()

  resultEvaluator.forEach((evaluator, index) => {
    const evaluatorId = `Ev${index + 1}`

    table.header.push({
      title: evaluatorId,
      align: 'center',
      value: evaluatorId,
    })

    if (!Array.isArray(evaluator?.heuristics)) return

    evaluator.heuristics.forEach((heuristic) => {
      const totalQuestions = toFiniteNumber(heuristic?.totalQuestionsValues)
      const row = rowsByHeuristic.get(heuristic.id) || {
        heuristic: heuristic.id,
        max: maxOption * totalQuestions,
        min: minOption * totalQuestions,
      }

      row[evaluatorId] = heuristic.result
      rowsByHeuristic.set(heuristic.id, row)
    })
  })

  table.items = Array.from(rowsByHeuristic.values())
  return table
}

function buildHeuristicsStatistics(heuristicsEvaluator) {
  const table = {
    header: [
      { ...HEURISTICS_HEADER, value: 'name' },
      {
        title: 'Percentage (%)',
        value: 'percentage',
        align: 'center',
        sortable: false,
      },
      {
        title: 'Standard deviation',
        value: 'sd',
        align: 'center',
        sortable: false,
      },
      { title: 'Average', value: 'average', align: 'center', sortable: false },
      { title: 'Max', value: 'max', align: 'center', sortable: false },
      { title: 'Min', value: 'min', align: 'center', sortable: false },
    ],
    items: [],
  }

  if (!heuristicsEvaluator?.items?.length) return table

  table.items = heuristicsEvaluator.items.map((item) => {
    const results = Object.entries(item)
      .filter(([key, value]) => key.startsWith('Ev') && value != null)
      .map(([, value]) => toFiniteNumber(value))
    const averageValue = results.length
      ? results.reduce((sum, value) => sum + value, 0) / results.length
      : 0
    const maxValue = toFiniteNumber(item.max)
    const minValue = toFiniteNumber(item.min)

    return {
      name: item.heuristic || 'Unknown',
      max: maxValue.toFixed(2),
      min: minValue.toFixed(2),
      percentage:
        maxValue !== minValue
          ? percentage(averageValue - minValue, maxValue - minValue).toFixed(2)
          : EMPTY_PERCENTAGE,
      sd: standardDeviation(results).toFixed(2),
      average: averageValue.toFixed(2),
    }
  })

  return table
}

export {
  percentage,
  standardDeviation,
  calcFinalResult,
  statistics,
  finalResult,
  buildHeuristicTestBundlePayload,
  downloadHeuristicTestBundlePayload,
  buildHeuristicsStatistics,
  buildHeuristicsEvaluator,
  parseTimeSpentToMs,
  formatTimeSpentFromMs,
}
