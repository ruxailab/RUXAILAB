import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import store from '@/store'

/**
 * Estructura global para almacenar estadisticas finales del estudio.
 *
 * Campos:
 * - average: promedio global entre evaluadores (string con % al final).
 * - max: puntaje maximo encontrado (string con % al final).
 * - min: puntaje minimo encontrado (string con % al final).
 * - sd: desviacion estandar de los puntajes (string con % al final).
 *
 * Valor inicial:
 * - Todos los campos en null hasta que `finalResult()` los calcule.
 */
const testData = {
  average: null,
  max: null,
  min: null,
  sd: null,
}

/**
 * Calcula un porcentaje simple a partir de una parte y un total.
 *
 * @param {number} value Parte del total.
 * @param {number} result Total base del calculo.
 * @returns {number} Porcentaje numerico sin formatear.
 *
 * Formula:
 * (value * 100) / result
 */
function percentage(value, result) {
  return (value * 100) / result
}

/**
 * Calcula la desviacion estandar poblacional de un arreglo numerico.
 *
 * Variables internas:
 * - average: media del arreglo.
 * - total/value/valor: acumuladores usados en `reduce`.
 *
 * @param {number[]} array Lista de valores numericos.
 * @returns {number} Desviacion estandar numerica (sin %).
 *
 * Proceso:
 * 1) Calcula la media.
 * 2) Calcula la varianza poblacional como promedio de diferencias al cuadrado.
 * 3) Retorna la raiz cuadrada de la varianza.
 */
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

function parseTimeSpentToMs(timeSpent) {
  if (typeof timeSpent !== 'string') return 0
  const [minutes = '0', seconds = '0'] = timeSpent.split(':')
  const min = Number(minutes)
  const sec = Number(seconds)
  if (!Number.isFinite(min) || !Number.isFinite(sec)) return 0
  return (Math.max(0, min) * 60 + Math.max(0, sec)) * 1000
}

function formatTimeSpentFromMs(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Calcula el resultado final de un evaluador en porcentaje.
 *
 * Variables internas creadas:
 * - result: suma de puntajes obtenidos en todas las heuristicas.
 * - qtdQuestion: total de preguntas consideradas.
 * - qtdNoAplication: total de preguntas marcadas como "no aplica".
 * - test: configuracion actual del test desde el store.
 * - maxOption: valor maximo posible por pregunta segun opciones del test.
 * - individualResult: puntaje de una heuristica individual.
 * - perfectResult: puntaje maximo teorico posible para normalizar a porcentaje.
 *
 * Reglas:
 * - Si falta `test` o `testOptions`, retorna "0.00" para evitar errores.
 * - Si una heuristica tiene resultado -1, se toma como 0.
 * - Si `perfectResult` es 0, retorna "0.00".
 *
 * @param {Array<{result:number,totalQuestions:number,totalNoAplication:number}>} array
 * Lista de resultados por heuristica.
 * @returns {string} Porcentaje final con 2 decimales (ej. "87.50").
 */
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

/**
 * Obtiene respuestas desde el store en formato arreglo.
 *
 * Logica:
 * - Si existe `testAnswerDocument` y el tipo es HEURISTIC, usa `heuristicAnswers`.
 * - Si existe pero no es HEURISTIC, usa `taskAnswers`.
 * - Si no existe documento, retorna arreglo vacio.
 *
 * @returns {Array} Arreglo de respuestas para su procesamiento posterior.
 */
function answers() {
  if (store.getters.testAnswerDocument) {
    return store.getters.testAnswerDocument.type === STUDY_TYPES.HEURISTIC
      ? Object.values(store.getters.testAnswerDocument.heuristicAnswers || {})
      : Object.values(store.getters.testAnswerDocument.taskAnswers || {})
  }
  return []
}

/**
 * Dispara el procesamiento de estadisticas en el store.
 *
 * @param {Array} resultEvaluator Lista de evaluadores ya calculada.
 * @returns {void}
 */
function created(resultEvaluator) {
  store.dispatch('processStatistics', {
    resultEvaluator: resultEvaluator,
  })
}

/**
 * Construye la estructura de resultados por evaluador para estudios heurisiticos.
 *
 * Variables internas creadas:
 * - test/testAnswerDocument: datos base del store para validar y procesar.
 * - resultEvaluator: arreglo final de evaluadores con sus resultados.
 * - SelectEvaluator: evaluador actual (encontrado o recien creado).
 * - heurisIndex: contador para IDs de heuristica (H1, H2, ...).
 * - noAplication: contador de preguntas con valor null.
 * - noReply: contador de preguntas vacias o incompletas.
 * - res: suma de respuestas de una heuristica concreta.
 *
 * Resultado esperado:
 * - Para tipo HEURISTIC retorna una lista ordenada por `lastUpdate` descendente.
 * - Cada evaluador incluye sus heuristicas y su `result` final en porcentaje.
 * - Si faltan datos base o no aplica el tipo, retorna [].
 *
 * @returns {Array}
 */
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
        let warningCount = 0
        let res = heuristic.heuristicQuestions.reduce(
          (totalQuestions, question) => {
            const hasWarning = Boolean(
              question?.warning === true ||
              question?.heuristicAnswer?.warning === true,
            )

            if (hasWarning) {
              warningCount++
            }

            // Si hay warning con NoAplication, no se descuenta del total aplicable.
            if (question.heuristicAnswer.value === null && !hasWarning) {
              noAplication++
            }
            if (
              question.heuristicAnswer.value === 0 ||
              question.heuristicAnswer.value === '0'
            )
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
          totalWarning: warningCount,
          totalNoReply: noReply,
          timeSpentMs: parseTimeSpentToMs(heuristic.timeSpent),
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

/**
 * Calcula estadisticas globales entre todos los evaluadores procesados.
 *
 * Variables internas:
 * - evaluatorStatistics: estructura del store con items por evaluador.
 * - res: promedio acumulado de los resultados validos.
 *
 * Salidas esperadas en `testData`:
 * - average: promedio general con 2 decimales y "%".
 * - max: valor maximo con 2 decimales y "%".
 * - min: valor minimo con 2 decimales y "%".
 * - sd: desviacion estandar con 2 decimales y "%".
 *
 * @returns {{average:string|null,max:string|null,min:string|null,sd:string|null}}
 * Objeto `testData` actualizado.
 */
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

/**
 * Genera una tabla comparativa: heuristicas en filas y evaluadores en columnas.
 *
 * Variables internas creadas:
 * - table: estructura final de cabecera + items para render de tabla.
 * - options: valores numericos permitidos en `testOptions`.
 * - maxVal/minVal: extremos de la escala de respuesta del test.
 * - evaluatorIndex: contador para etiquetar evaluadores como Ev1, Ev2, ...
 * - evId: id de la columna del evaluador actual.
 * - item: fila existente de la heuristica para actualizar o crear.
 * - maxSum/minSum/count/resultsArray: acumuladores por fila para estadistica.
 *
 * Post-proceso por fila:
 * - max = maxSum / count
 * - min = minSum / count
 * - sd = standardDeviation(resultsArray)
 *
 * Luego se eliminan propiedades tecnicas de acumulacion antes del retorno.
 *
 * @param {Array} resultEvaluator Evaluadores con sus heuristicas calculadas.
 * @param {Array<{value:number}>} testOptions Opciones del test para calcular max/min.
 * @returns {{header:Array,items:Array}} Tabla preparada para vista comparativa.
 */
function buildHeuristicsEvaluator(resultEvaluator, testOptions) {
  const table = {
    header: [{ title: 'HEURISTICS', align: 'start', value: 'heuristic' }],
    items: [],
  }

  const options = Array.isArray(testOptions)
    ? testOptions.map((op) => op.value)
    : []
  const maxVal = options.length > 0 ? Math.max(...options) : 0
  const minVal = options.length > 0 ? Math.min(...options) : 0

  if (!Array.isArray(resultEvaluator)) return table

  let evaluatorIndex = 1
  for (const evaluator of resultEvaluator) {
    const evId = `Ev${evaluatorIndex}`
    evaluator.id = evId
    if (!table.header.find((h) => h.value === evId)) {
      table.header.push({
        text: evId,
        align: 'center',
        value: evId,
      })
    }

    if (Array.isArray(evaluator.heuristics)) {
      for (const heuristic of evaluator.heuristics) {
        let item = table.items.find((i) => i.heuristic === heuristic.id)

        if (!item) {
          item = {
            heuristic: heuristic.id,
            // Compatibilidad: mantiene max/min como en la estructura previa.
            max: 0,
            min: 0,
            maxSum: 0,
            minSum: 0,
            count: 0,
            validCount: 0,
            resultsArray: [],
            maxValues: [],
            minValues: [],
            warningValuesMax: [],
            warningValuesMin: [],
            sumResults: 0,
            averageResult: '0.00',
            maxAverage: '0.00',
            minAverage: '0.00',
            warningCount: 0,
            maxWarning: '0.00',
            minWarning: '0.00',
            warningImpactMaxPercentage: '0.00',
            warningImpactMinPercentage: '0.00',
            totalPercentageWithMaxWarning: '0.00',
            totalPercentageWithMinWarning: '0.00',
            sd: '0.00',
          }
          table.items.push(item)
        }

        const resValue = heuristic.result || 0
        const rowMaxValue = maxVal * (heuristic.totalQuestions || 0)
        const rowMinValue = minVal * (heuristic.totalQuestions || 0)
        const warningPerHeuristic = Number(heuristic.totalWarning || 0)
        const warningMaxValue = warningPerHeuristic * maxVal
        const warningMinValue = warningPerHeuristic * minVal

        item[evId] = resValue
        item.resultsArray.push(resValue)
        item.maxValues.push(rowMaxValue)
        item.minValues.push(rowMinValue)
        item.warningValuesMax.push(warningMaxValue)
        item.warningValuesMin.push(warningMinValue)
        item.maxSum += rowMaxValue
        item.minSum += rowMinValue
        item.sumResults += resValue
        item.warningCount += warningPerHeuristic
        item.count++
        if (heuristic.result !== null && heuristic.result !== undefined) {
          item.validCount++
        }
      }
    }

    evaluatorIndex++
  }

  table.items.forEach((item) => {
    if (item.count > 0) {
      // max/min se mantienen como salida principal de fila (promedio de rangos).
      item.max = (item.maxSum / item.count).toFixed(2)
      item.min = (item.minSum / item.count).toFixed(2)

      // Variables adicionales para analisis sin perder informacion de acumulacion.
      item.maxAverage = item.max
      item.minAverage = item.min
      item.averageResult = (item.sumResults / item.count).toFixed(2)
      item.maxWarning = item.warningValuesMax
        .reduce((sum, val) => sum + val, 0)
        .toFixed(2)
      item.minWarning = item.warningValuesMin
        .reduce((sum, val) => sum + val, 0)
        .toFixed(2)
      item.sd = standardDeviation(item.resultsArray).toFixed(2)
    } else {
      item.max = '0.00'
      item.min = '0.00'
      item.maxAverage = '0.00'
      item.minAverage = '0.00'
      item.averageResult = '0.00'
      item.maxWarning = '0.00'
      item.minWarning = '0.00'
      item.sd = '0.00'
    }
  })

  if (!table.header.find((h) => h.value === 'sd')) {
    table.header.push({ text: 'SD', align: 'center', value: 'sd' })
  }

  return table
}

/**
 * Genera estadisticas por heuristica a partir de la tabla de evaluadores.
 *
 * Variables internas creadas:
 * - table: estructura final de tabla estadistica.
 * - item: fila de heuristica proveniente de `heuristicsEvaluator.items`.
 * - results: valores de todos los evaluadores (columnas EvX) para esa heuristica.
 * - average: promedio de la heuristica.
 * - percentage: promedio normalizado entre min y max en escala 0-100.
 *
 * Resultado esperado por fila:
 * - name: nombre/id de heuristica.
 * - max/min: limites teoricos para esa heuristica.
 * - percentage: rendimiento porcentual normalizado.
 * - sd: dispersion entre evaluadores.
 * - average: promedio absoluto de la heuristica.
 *
 * @param {{items:Array}} heuristicsEvaluator Tabla base con filas por heuristica.
 * @returns {{header:Array,items:Array}} Tabla estadistica lista para UI/reporte.
 */
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
      {
        title: 'Warning Impact Max (%)',
        value: 'warningImpactMaxPercentage',
        align: 'center',
        sortable: false,
      },
      {
        title: 'Warning Impact Min (%)',
        value: 'warningImpactMinPercentage',
        align: 'center',
        sortable: false,
      },
      {
        title: 'Total % + Warning Max',
        value: 'totalPercentageWithMaxWarning',
        align: 'center',
        sortable: false,
      },
      {
        title: 'Total % + Warning Min',
        value: 'totalPercentageWithMinWarning',
        align: 'center',
        sortable: false,
      },
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

    const range = Number(item.max || 0) - Number(item.min || 0)
    const warningImpactMaxPercentage =
      range > 0
        ? ((Number(item.maxWarning || 0) / range) * 100).toFixed(2)
        : '0.00'
    const warningImpactMinPercentage =
      range > 0
        ? ((Number(item.minWarning || 0) / range) * 100).toFixed(2)
        : '0.00'
    const totalPercentageWithMaxWarning = (
      Number(percentage) + Number(warningImpactMaxPercentage)
    ).toFixed(2)
    const totalPercentageWithMinWarning = (
      Number(percentage) + Number(warningImpactMinPercentage)
    ).toFixed(2)

    table.items.push({
      name: item.heuristic || 'Unknown',
      max: item.max ? Number(item.max).toFixed(2) : '0.00',
      min: item.min ? Number(item.min).toFixed(2) : '0.00',
      percentage,
      sd: results.length ? standardDeviation(results).toFixed(2) : '0.00',
      average,
      warningCount: Number(item.warningCount || 0),
      maxWarning: Number(item.maxWarning || 0).toFixed(2),
      minWarning: Number(item.minWarning || 0).toFixed(2),
      warningImpactMaxPercentage,
      warningImpactMinPercentage,
      totalPercentageWithMaxWarning,
      totalPercentageWithMinWarning,
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
  parseTimeSpentToMs,
  formatTimeSpentFromMs,
}
