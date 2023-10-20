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

  const mockUserAnswers = [
    {
      type: 'typeA',
      taskAnswers: {
        'userDocID_1': {
          preTestUrl: 'https://example.com/pretest_A_1',
          consentUrl: 'https://example.com/consent_A_1',
          postTestUrl: 'https://example.com/posttest_A_1',
          tasks: {
            'taskId_1': {
              taskAnswer: 'Answer to Task A1',
              taskObservations: 'Observations for Task A1',
              taskTime: 'Task A1 Time',
              audioRecordURL: 'https://example.com/audio_A_1',
              screenRecordURL: 'https://example.com/screen_A_1',
              webcamRecordURL: 'https://example.com/webcam_A_1',
            },
            'taskId_2': {
              taskAnswer: 'Answer to Task A2',
              taskObservations: 'Observations for Task A2',
              taskTime: 'Task A2 Time',
              audioRecordURL: 'https://example.com/audio_A_2',
              screenRecordURL: 'https://example.com/screen_A_2',
              webcamRecordURL: 'https://example.com/webcam_A_2',
            },
          },
          progress: 60,
          total: 100,
          submitted: true,
          userDocId: 'userDocID_1',
          lastUpdate: new Date(), // Current timestamp
        },
      },
    },
    {
      type: 'typeB',
      taskAnswers: {
        'userDocID_2': {
          preTestUrl: 'https://example.com/pretest_B_1',
          consentUrl: 'https://example.com/consent_B_1',
          postTestUrl: 'https://example.com/posttest_B_1',
          tasks: {
            'taskId_1': {
              taskAnswer: 'Answer to Task B1',
              taskObservations: 'Observations for Task B1',
              taskTime: 'Task B1 Time',
              audioRecordURL: 'https://example.com/audio_B_1',
              screenRecordURL: 'https://example.com/screen_B_1',
              webcamRecordURL: 'https://example.com/webcam_B_1',
            },
          },
          progress: 30,
          total: 100,
          submitted: true,
          userDocId: 'userDocID_2',
          lastUpdate: new Date(), // Current timestamp
        },
      },
    },
    {
      type: 'typeC',
      taskAnswers: {
        'userDocID_3': {
          preTestUrl: 'https://example.com/pretest_C_1',
          consentUrl: 'https://example.com/consent_C_1',
          postTestUrl: 'https://example.com/posttest_C_1',
          tasks: {
            'taskId_1': {
              taskAnswer: 'Answer to Task C1',
              taskObservations: 'Observations for Task C1',
              taskTime: 'Task C1 Time',
              audioRecordURL: 'https://example.com/audio_C_1',
              screenRecordURL: 'https://example.com/screen_C_1',
              webcamRecordURL: 'https://example.com/webcam_C_1',
            },
            'taskId_2': {
              taskAnswer: 'Answer to Task C2',
              taskObservations: 'Observations for Task C2',
              taskTime: 'Task C2 Time',
              audioRecordURL: 'https://example.com/audio_C_2',
              screenRecordURL: 'https://example.com/screen_C_2',
              webcamRecordURL: 'https://example.com/webcam_C_2',
            },
          },
          progress: 40,
          total: 100,
          submitted: true,
          userDocId: 'userDocID_3',
          lastUpdate: new Date(), // Current timestamp
        },
      },
    },
  ]

  const taskAnswersArray = []

  for (const userAnswer of mockUserAnswers) {
    const taskAnswers = userAnswer.taskAnswers
    for (const userDocId in taskAnswers) {
      taskAnswersArray.push(taskAnswers[userDocId])
    }
  }

  if (store.getters.testAnswerDocument) {
    return store.getters.testAnswerDocument.type === 'HEURISTICS'
      ? Object.values(store.getters.testAnswerDocument.heuristicAnswers)
      : Object.values(taskAnswersArray)
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
  const resultEvaluator = []
  const answersA = answers()

  let evaluatorIndex = 1
  answersA.forEach((evaluator) => {
    console.log(evaluator)
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
    if (store.getters.testAnswerDocument?.type === 'HEURISTICS') {
      console.log('======= fell on if =======')
      let heurisIndex = 1
      evaluator.heuristicQuestions.forEach((heuristic) => {
        let noAplication = 0
        let noReply = 0
        let res = heuristic.heuristicQuestions.reduce(
          (totalQuestions, question) => {
            if (question.heuristicAnswer === null) {
              noAplication++
            }
            if (question.heuristicAnswer === '') noReply++
            return totalQuestions + Number(question.heuristicAnswer)
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
    } else {
    }

  })

  resultEvaluator.forEach((ev) => {
    ev.result = calcFinalResult(ev.heuristics)
  })
  return resultEvaluator
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
