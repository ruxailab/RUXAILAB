import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import store from '@/store'

// Final Statistic
// Final Result
const testData = {
  average: null,
  max: null,
  min: null,
  sd: null,
}

function percentage(value, result) {
  return (value * 100) / result
}

function standardDeviation(array) {
  const average = array.reduce(
    (total, value) => total + value / array.length,
    0,
  )
  return Math.sqrt(
    array.reduce(
      (total, valor) => total + Math.pow(average - valor, 2) / array.length,
      0,
    ),
  )
}

function calcFinalResult(array) {
  let result = 0
  let qtdQuestion = 0
  let qtdNoAplication = 0

  // Check if test and testOptions exist
  const test = store.getters.test
  if (!test || !Array.isArray(test.testOptions)) {
    console.warn('calcFinalResult: test or testOptions is not available', test)
    return '0.00' // Return a default value to prevent errors
  }

  const maxOption = Math.max(...test.testOptions.map((item) => item.value))

  array.forEach((res) => {
    let individualResult = res.result
    if (individualResult === -1) {
      individualResult = 0
    }

    result += individualResult
    qtdQuestion += res.totalQuestions
    qtdNoAplication += res.totalNoAplication
  })

  const perfectResult = (qtdQuestion - qtdNoAplication) * maxOption
  return perfectResult === 0
    ? '0.00'
    : ((result * 100) / perfectResult).toFixed(2)
}

function answers() {
  if (store.getters.testAnswerDocument) {
    return store.getters.testAnswerDocument.type === STUDY_TYPES.HEURISTIC
      ? Object.values(store.getters.testAnswerDocument.heuristicAnswers || {})
      : Object.values(store.getters.testAnswerDocument.taskAnswers || {})
  }
  return []
}

// Final statistics
function created(resultEvaluator) {
  store.dispatch('processStatistics', {
    resultEvaluator: resultEvaluator,
  })
}

function statistics() {
  // Check if test and testAnswerDocument exist
  const test = store.getters.test
  const testAnswerDocument = store.getters.testAnswerDocument
  if (!test || !testAnswerDocument) {
    console.warn('statistics: test or testAnswerDocument is not available', {
      test,
      testAnswerDocument,
    })
    return []
  }

  if (testAnswerDocument.type === STUDY_TYPES.HEURISTIC) {
    const resultEvaluator = []

    // Get Evaluator answers
    answers().forEach((evaluator) => {
      let SelectEvaluator = resultEvaluator.find(
        (e) => e.userDocId == evaluator.userDocId,
      )

      if (!SelectEvaluator) {
        resultEvaluator.push({
          userDocId: evaluator.userDocId,
          id: evaluator.userDocId,
          heuristics: [],
          result: 0,
          lastUpdate: evaluator.lastUpdate,
        })
        SelectEvaluator = resultEvaluator[resultEvaluator.length - 1]
      } else {
        // Update lastUpdate if evaluator already exists
        SelectEvaluator.lastUpdate = evaluator.lastUpdate
      }

      // Get Heuristics for evaluators
      let heurisIndex = 1
      evaluator.heuristicQuestions.forEach((heuristic) => {
        let noAplication = 0
        let noReply = 0
        let res = heuristic.heuristicQuestions.reduce(
          (totalQuestions, question) => {
            if (question.heuristicAnswer.value === null) {
              noAplication++
            }
            if (
              question.heuristicAnswer.value === '' ||
              Object.values(question.heuristicAnswer).length < 3
            )
              noReply++
            return totalQuestions + Number(question.heuristicAnswer.value)
          },
          0,
        )

        if (noAplication == heuristic.heuristicQuestions.length) res = null

        SelectEvaluator.heuristics.push({
          id: `H${heurisIndex}`,
          result: res == -1 ? 0 : res,
          totalQuestions: heuristic.heuristicTotal,
          totalNoAplication: noAplication,
          totalNoReply: noReply,
        })
        heurisIndex++
      })
    })

    // Sort resultEvaluator based on lastUpdate
    resultEvaluator.sort((a, b) => b.lastUpdate - a.lastUpdate)

    // Calc Final result
    resultEvaluator.forEach((ev) => {
      ev.result = calcFinalResult(ev.heuristics)
    })

    return resultEvaluator
  }
  return []
}

function finalResult() {
  const evaluatorStatistics = store.state.Answer.evaluatorStatistics
  if (evaluatorStatistics.items.length) {
    const res = evaluatorStatistics.items.reduce((total, value) => {
      return !isNaN(parseInt(value.result))
        ? total + value.result / evaluatorStatistics.items.length
        : 0
    }, 0)

    testData.average = `${Math.fround(res).toFixed(2)}%`

    testData.max = `${Math.max(
      ...evaluatorStatistics.items.map((item) =>
        !isNaN(parseInt(item.result)) ? item.result : 0,
      ),
    ).toFixed(2)}%`

    testData.min = `${Math.min(
      ...evaluatorStatistics.items.map((item) =>
        !isNaN(parseInt(item.result)) ? item.result : 0,
      ),
    ).toFixed(2)}%`

    testData.sd = `${standardDeviation(
      evaluatorStatistics.items.map((item) =>
        !isNaN(parseInt(item.result)) ? item.result : 0,
      ),
    ).toFixed(2)}%`
  }
  return testData
}

function buildHeuristicsEvaluator(resultEvaluator, testOptions) {
  const table = {
    header: [{ title: 'HEURISTICS', align: 'start', value: 'heuristic' }],
    items: [],
  }

  const options = Array.isArray(testOptions)
    ? testOptions.map((op) => op.value)
    : []
  const max = options.length > 0 ? Math.max(...options) : 0
  const min = options.length > 0 ? Math.min(...options) : 0

  if (!Array.isArray(resultEvaluator)) return table

  let evaluatorIndex = 1
  for (const evaluator of resultEvaluator) {
    evaluator.id = `Ev${evaluatorIndex}`
    const headerExists = table.header.find((h) => h.value === evaluator.id)
    if (!headerExists) {
      table.header.push({
        text: evaluator.id,
        align: 'center',
        value: evaluator.id,
      })
    }

    if (Array.isArray(evaluator.heuristics)) {
      for (const heuristic of evaluator.heuristics) {
        const item = table.items.find((i) => i.heuristic === heuristic.id)
        if (item) {
          item[evaluator.id] = heuristic.result
        } else {
          table.items.push({
            heuristic: heuristic.id,
            max: max * (heuristic.totalQuestions || 0),
            min: min * (heuristic.totalQuestions || 0),
            [evaluator.id]: heuristic.result,
          })
        }
      }
    }

    evaluatorIndex++
  }

  return table
}

function buildHeuristicsStatistics(heuristicsEvaluator) {
  const table = {
    header: [
      { title: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
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

  for (const item of heuristicsEvaluator.items) {
    const results = Object.entries(item)
      .filter(([key]) => key.includes('Ev'))
      .map(([, value]) => value)
      .filter((value) => value !== undefined && value !== null)

    const average = results.length
      ? (results.reduce((sum, val) => sum + val, 0) / results.length).toFixed(2)
      : '0.00'

    const percentage =
      item.max && item.min && item.max !== item.min
        ? (((average - item.min) / (item.max - item.min)) * 100).toFixed(2)
        : '0.00'

    table.items.push({
      name: item.heuristic || 'Unknown',
      max: item.max ? Number(item.max).toFixed(2) : '0.00',
      min: item.min ? Number(item.min).toFixed(2) : '0.00',
      percentage,
      sd: results.length ? standardDeviation(results).toFixed(2) : '0.00',
      average,
    })
  }

  return table
}

export {
  percentage,
  standardDeviation,
  calcFinalResult,
  statistics,
  finalResult,
  buildHeuristicsStatistics,
  buildHeuristicsEvaluator,
}
