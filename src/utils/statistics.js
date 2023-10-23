import store from '@/store'

//final Statistic
//final Result
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
  const average = array.reduce((total, value) => total + value / array.length, 0)
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
  const maxOption = Math.max(
    ...store.getters.test.testOptions.map((item) => item.value),
  )

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
  return ((result * 100) / perfectResult).toFixed(1)
}

function answers() {
  if (store.getters.testAnswerDocument) {
    return store.getters.testAnswerDocument.type === 'HEURISTICS'
      ? Object.values(store.getters.testAnswerDocument.heuristicAnswers)
      : Object.values(store.getters.testAnswerDocument.taskAnswers)
  }
  return []
}

//final statistics

function created(resultEvaluator) {
  store.dispatch('processStatistics', {
    resultEvaluator: resultEvaluator,
  })
}

function statistics() {
  if (store.getters.testAnswerDocument?.type === 'HEURISTICS') {
    const resultEvaluator = []
    const answersA = answers()

    //Get Evaluator answers
    let evaluatorIndex = 1
    answersA.forEach((evaluator) => {
      let SelectEvaluator = resultEvaluator.find(
        (e) => e.userDocId == `Ev${evaluatorIndex}`,
      )
      if (!SelectEvaluator) {
        resultEvaluator.push({
          userDocId: evaluator.userDocId,
          email: 'noemail@email.com',
          id: `Ev${evaluatorIndex}`,
          heuristics: [],
          result: 0,
        })
        SelectEvaluator = resultEvaluator[resultEvaluator.length - 1]
      }
      //Get Heuristics for evaluators
      let heurisIndex = 1
      evaluator.heuristicQuestions.forEach((heuristic) => {
        //Get Questions for heuristic

        let noAplication = 0
        let noReply = 0
        let res = heuristic.heuristicQuestions.reduce(
          (totalQuestions, question) => {
            //grouping of answers
            if (question.heuristicAnswer === null) {
              noAplication++
            } //count answers no aplication
            if (question.heuristicAnswer === '') noReply++
            return totalQuestions + Number(question.heuristicAnswer) //sum of responses
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
      evaluatorIndex++
    })

    //Calc Final result
    resultEvaluator.forEach((ev) => {
      ev.result = calcFinalResult(ev.heuristics)
    })

    // created(resultEvaluator)
    return resultEvaluator
  }
}

function finalResult() {
  const evaluatorStatistics = store.state.Answer.evaluatorStatistics
  if (evaluatorStatistics.items.length) {
    const res = evaluatorStatistics.items.reduce((total, value) => {
      return total + value.result / evaluatorStatistics.items.length
    }, 0)

    testData.average = `${Math.fround(res).toFixed(1)}%`

    testData.max = `${Math.max(
      ...evaluatorStatistics.items.map((item) => item.result),
    ).toFixed(1)}%`

    testData.min = `${Math.min(
      ...evaluatorStatistics.items.map((item) => item.result),
    ).toFixed(1)}%`

    testData.sd = `${standardDeviation(
      evaluatorStatistics.items.map((item) => item.result),
    ).toFixed(1)}%`
  }
  return testData
}

// this.$store.getters.test
export {
  percentage,
  standardDeviation,
  calcFinalResult,
  statistics,
  finalResult,
}
