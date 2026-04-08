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

/**
 * Estructura global para almacenar estadisticas de warnings.
 *
 * Campos:
 * - baseWarning: promedio global considerando warnings como preguntas aplicables (string con % al final).
 * - maxWarning: promedio global si los warnings se cuentan como máxima puntuación (string con % al final).
 * - minWarning: promedio global si los warnings se cuentan como mínima puntuación (string con % al final).
 * - impacto: diferencia entre average (finalResult) y baseWarning (string con % al final).
 *
 * Valor inicial:
 * - Todos los campos en null hasta que `FinalResultWarnings()` los calcule.
 */
const warningsData = {
  baseWarning: null,
  maxWarning: null,
  minWarning: null,
  impactWarning: null,
}

/**
 * Calcula el porcentaje de un valor respecto a un total.
 *
 * Uso interno: Se utiliza para convertir puntuaciones brutas en porcentajes
 * que se muestran en la interfaz de resultados.
 *
 * @param {number} value - El valor a convertir a porcentaje
 * @param {number} result - El valor total (denominador)
 * @returns {number} El porcentaje resultante (ej: 75 si value es 75% de result)
 *
 * Ejemplo: percentage(75, 100) => 75
 */
function percentage(value, result) {
  return (value * 100) / result
}

/**
 * Calcula la desviación estándar de un array de valores numéricos.
 *
 * Uso interno: Mide la dispersión de puntuaciones entre evaluadores.
 * Se muestra en la tabla de estadísticas heurísticas para indicar cuánto varían
 * las evaluaciones de un heurístico entre diferentes evaluadores.
 *
 * Variables internas:
 * - average: Promedio de todos los valores del array
 * - desviaciones: Suma de (valor - promedio)² / cantidad de valores
 *
 * @param {number[]} array - Array de valores numéricos
 * @returns {number} La desviación estándar del conjunto de datos
 *
 * Ejemplo: standardDeviation([1, 2, 3]) => 0.816... (variabilidad de datos)
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

/**
 * Convierte un tiempo en formato "MM:SS" a milisegundos.
 *
 * Uso interno: Parseo de tiempos que el evaluador dedicó a cada heurística.
 * Almacena el tiempo en milisegundos en stats para análisis posterior.
 *
 * Variables internas:
 * - minutes, seconds: Extraídos del string con split(':'), por defecto '0'
 * - Valida que sean números finitos antes de calcular
 * - Asegurar que minutos y segundos sean >= 0 con Math.max(0, ...)
 *
 * @param {string|*} timeSpent - String en formato "MM:SS", ej: "02:45"
 * @returns {number} Tiempo en milisegundos, 0 si entrada inválida
 *
 * Ejemplo: parseTimeSpentToMs("02:45") => 165000 (2 min 45 seg en ms)
 *          parseTimeSpentToMs(null) => 0
 */
function parseTimeSpentToMs(timeSpent) {
  if (typeof timeSpent !== 'string') return 0
  const [minutes = '0', seconds = '0'] = timeSpent.split(':')
  const min = Number(minutes)
  const sec = Number(seconds)
  if (!Number.isFinite(min) || !Number.isFinite(sec)) return 0
  return (Math.max(0, min) * 60 + Math.max(0, sec)) * 1000
}

/**
 * Convierte milisegundos a formato "MM:SS" legible para mostrar en UI.
 *
 * Uso interno: Inverso de parseTimeSpentToMs.
 * Formatea el tiempo almacenado internamente para presentarlo en la interfaz
 * como "02:45" en lugar de 165000ms.
 *
 * Variables internas:
 * - totalSeconds: Convierte ms a segundos enteros, mínimo 0
 * - minutes: Cantidad completa de minutos
 * - seconds: Segundos restantes después de quitar minutos
 * - padStart(2, '0'): Asegura que ambos componentes sean de 2 dígitos
 *
 * @param {number} ms - Tiempo en milisegundos
 * @returns {string} Tiempo formateado como "MM:SS", ej: "02:45"
 *
 * Ejemplo: formatTimeSpentFromMs(165000) => "02:45"
 *          formatTimeSpentFromMs(-100) => "00:00"
 */
function formatTimeSpentFromMs(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Calcula resultados finales por evaluador a partir del array de heurísticas ya procesadas.
 *
 * Uso interno: Se invoca al final de statistics() para cada evaluador.
 * Además del porcentaje general, calcula métricas equivalentes considerando warnings.
 *
 * Parámetro:
 * @param {Array<{result, totalQuestions, totalNoAplication, totalWarnings, timeSpentMs}>} array
 *        Array de heurísticas del evaluador con acumulados por heurística.
 *
 * Variables internas y fórmulas:
 * - result: suma de puntuaciones brutas del evaluador
 * - qtdQuestion: total de preguntas del evaluador
 * - qtdNoAplication: preguntas marcadas como no aplicables
 * - totalWarnings: total de warnings detectados en todas las heurísticas
 * - maxOption/minOption: límites de la escala según testOptions
 * - perfectResult = (qtdQuestion - qtdNoAplication) * maxOption
 * - perfResultWarnings = (qtdQuestion - qtdNoAplication + totalWarnings) * maxOption
 * - result(%) = (result * 100) / perfectResult
 * - baseWarning(%) = (result * 100) / perfResultWarnings
 * - maxWarning(%) = ((result + totalWarnings * maxOption) * 100) / perfResultWarnings
 * - minWarning(%) = ((result + totalWarnings * minOption) * 100) / perfResultWarnings
 *
 * Retorna:
 * @returns {{
 *   result: string,
 *   baseWarning: string,
 *   maxWarning: string,
 *   minWarning: string,
 *   perfResultWarnings: number,
 *   totalWarnings: number
 * }} Objeto con porcentajes y acumulados del evaluador.
 *
 * Nota:
 * Si test/testOptions no está disponible, retorna un objeto con valores en 0
 * para evitar errores aguas abajo (Object.assign en statistics()).
 */
function calcFinalResult(array) {
  console.log('[calcFinalResult] input heuristics:', array)
  let result = 0
  let qtdQuestion = 0
  let totalWarnings = 0
  let qtdNoAplication = 0
  let applicableQuestions = 0 // Preguntas que sí aplican
  const heuristicsDetail = [] // Array detallado de cada heurística

  // Check if test and testOptions exist
  const test = store.getters.test
  if (!test || !Array.isArray(test.testOptions)) {
    console.warn('calcFinalResult: test or testOptions is not available', test)
    return {
      result: '0.00',
      baseWarning: '0.00',
      maxWarning: '0.00',
      minWarning: '0.00',
      perfResultWarnings: 0,
      totalWarnings: 0,
    }
  }

  console.log('[calcFinalResult] testOptions:', test.testOptions)

  const optionValues = test.testOptions
    .map((item) => Number(item.value))
    .filter((value) => Number.isFinite(value))
  const maxOption = optionValues.length ? Math.max(...optionValues) : 0
  const minOptionValues = optionValues.filter((value) => value !== 0)
  const minOption = minOptionValues.length ? Math.min(...minOptionValues) : 0

  array.forEach((res) => {
    let individualResult = res.result
    if (individualResult === -1) {
      individualResult = 0
    }

    // Guardar información de cada heurística
    heuristicsDetail.push({
      heuristicId: res.id,
      individualResult,
      totalQuestions: res.totalQuestions,
      totalNoAplication: res.totalNoAplication,
      totalWarnings: res.totalWarnings || 0,
      applicableForThisHeuristic: res.totalQuestions - res.totalNoAplication,
      timeSpentMs: res.timeSpentMs,
    })

    result += individualResult
    qtdQuestion += res.totalQuestions
    qtdNoAplication += res.totalNoAplication
    applicableQuestions += res.totalQuestions - res.totalNoAplication
    totalWarnings += res.totalWarnings || 0
  })

  const perfectResult = (qtdQuestion - qtdNoAplication) * maxOption
  const perfResultWarnings =
    (qtdQuestion - qtdNoAplication + totalWarnings) * maxOption
  const finalPct =
    perfectResult === 0 ? '0.00' : ((result * 100) / perfectResult).toFixed(2)
  const baseWarning =
    perfResultWarnings === 0
      ? '0.00'
      : ((result * 100) / perfResultWarnings).toFixed(2)
  const maxWarning =
    perfResultWarnings === 0
      ? '0.00'
      : (
          ((result + totalWarnings * maxOption) * 100) /
          perfResultWarnings
        ).toFixed(2)
  const minWarning =
    perfResultWarnings === 0
      ? '0.00'
      : (
          ((result + totalWarnings * minOption) * 100) /
          perfResultWarnings
        ).toFixed(2)

  console.log('[calcFinalResult] aggregates:', {
    result,
    qtdQuestion,
    qtdNoAplication,
    applicableQuestions,
    totalWarnings,
    maxOption,
    minOption,
    perfectResult,
    perfResultWarnings,
    finalPct,
    baseWarning,
    maxWarning,
    minWarning,
    heuristicsDetail,
  })

  return {
    result: finalPct,
    baseWarning,
    maxWarning,
    minWarning,
    perfResultWarnings,
    totalWarnings,
  }
}

/**
 * Obtiene las respuestas de los evaluadores desde el store (solo para tipo HEURISTIC).
 *
 * Uso interno: Getter que extrae datos del testAnswerDocument guardado en Vuex.
 * Normaliza el acceso a las respuestas sin importar si están en heuristicAnswers o taskAnswers.
 * Solo procesa respuestas de tipo HEURISTIC (otros tipos devuelven []).
 *
 * Variables internas:
 * - testAnswerDocument: Documento del store con todas las respuestas del test
 * - type: Campo que indica si es HEURISTIC, TASK, u otro tipo
 * - heuristicAnswers o taskAnswers: Objeto con las respuestas indexadas por evaluador
 * - Object.values(): Convierte el objeto en array de respuestas
 *
 * @returns {Array} Array con objetos de respuesta de evaluadores, ej:
 *         [
 *           { userDocId: 'eval1', heuristicQuestions: [...], lastUpdate: 123456 },
 *           { userDocId: 'eval2', heuristicQuestions: [...], lastUpdate: 123457 }
 *         ]
 *         Retorna [] si testAnswerDocument no existe o no es HEURISTIC
 *
 * En el flujo:
 * Lo usan statistics() y calcResultsWarnings() para iterar sobre evaluadores.
 */
function answers() {
  if (store.getters.testAnswerDocument) {
    console.log(
      '[answers] testAnswerDocument:',
      store.getters.testAnswerDocument,
    )
    const result =
      store.getters.testAnswerDocument.type === STUDY_TYPES.HEURISTIC
        ? Object.values(store.getters.testAnswerDocument.heuristicAnswers || {})
        : Object.values(store.getters.testAnswerDocument.taskAnswers || {})

    console.log('[answers] FUNCTION RETURNS - Full Array:', result)
    console.log('[answers] FUNCTION RETURNS - Array Length:', result.length)
    result.forEach((item, index) => {
      console.log(`[answers] Item ${index}:`, {
        userDocId: item.userDocId,
        hasHeuristicQuestions: !!item.heuristicQuestions,
        heuristicQuestionsCount: item.heuristicQuestions?.length,
        lastUpdate: item.lastUpdate,
      })
    })

    return result
  }
  return []
}

/**
 * Hook de ciclo de vida: Dispara el procesamiento de estadísticas en el store (Vuex).
 *
 * Uso interno: Normalmente invocada cuando el componente está siendo creado o montado.
 * Llama a la acción 'processStatistics' del store para que popule evaluatorStatistics
 * con los datos procesados.
 *
 * Parámetro:
 * @param {Array} resultEvaluator - Array de evaluadores con heurísticas procesadas
 *        (típicamente retornado por statistics() )
 *
 * Variables internas:
 * - store.dispatch(): Invoca una acción async/sync del store Vuex
 * - payload: { resultEvaluator } que será procesada en la acción
 *
 * En el flujo del store:
 * store => acción 'processStatistics' => mutación que actualiza store.state.Answer.evaluatorStatistics
 * Esto causa que la UI es reactive y se actualicen los datos mostrados.
 */
/**
 * Procesa respuestas HEURISTIC y construye el array resultEvaluator con todos los acumulados.
 *
 * Uso interno: Función principal de agregación por evaluador/heurística.
 * Esta función produce la fuente de verdad que después consumen finalResult(), tablas y tarjetas.
 *
 * ALGORITMO Y VARIABLES INTERNAS:
 * 1. Lee test y testAnswerDocument desde store
 * 2. Obtiene evaluadores con answers()
 * 3. Para cada evaluador y para cada heurística:
 *    - res: suma de valores de respuesta
 *    - noAplication: respuestas con value === null
 *    - noReply: respuestas vacías/incompletas
 *    - totalWarnings: cantidad de preguntas con warning === true
 *    - totalImages: cantidad total de imágenes por heurística
 *      (formato nuevo images[] + formato legacy answerImageUrl)
 *    - timeSpentMs: tiempo de la heurística en milisegundos
 * 4. Ordena evaluadores por lastUpdate desc
 * 5. En cada evaluador aplica calcFinalResult(heuristics) con Object.assign
 *    para añadir result/baseWarning/maxWarning/minWarning al mismo objeto.
 *
 * RETORNA:
 * @returns {Array} resultEvaluator con estructura por evaluador:
 *         {
 *           userDocId,
 *           id,
 *           heuristics: [
 *             {
 *               id,
 *               result,
 *               totalQuestions,
 *               totalNoAplication,
 *               totalNoReply,
 *               totalWarnings,
 *               totalImages,
 *               timeSpentMs
 *             }
 *           ],
 *           result,
 *           baseWarning,
 *           maxWarning,
 *           minWarning,
 *           totalWarnings
 *         }
 *
 * Importante:
 * Este array evita depender del estado intermedio del store para calcular resumen global.
 */
function statistics() {
  console.log('[statistics] start')
  // Check if test and testAnswerDocument exist
  const test = store.getters.test
  const testAnswerDocument = store.getters.testAnswerDocument

  console.log('[statistics] TEST VALUE:', test)
  console.log('[statistics] TEST ANSWER DOCUMENT VALUE:', testAnswerDocument)

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
    const answersData = answers()
    console.log('[statistics] ANSWERS() RESULT:', answersData)

    answersData.forEach((evaluator) => {
      console.log('[statistics] EVALUATOR:', {
        userDocId: evaluator.userDocId,
        heuristicQuestionsLength: evaluator.heuristicQuestions?.length,
        heuristicQuestions: evaluator.heuristicQuestions,
      })
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
        console.log('[statistics] HEURISTIC QUESTIONS (heuristic object):', {
          id: heuristic.id,
          heuristicTotal: heuristic.heuristicTotal,
          heuristicQuestionsLength: heuristic.heuristicQuestions?.length,
          heuristicQuestionsData: heuristic.heuristicQuestions,
          timeSpent: heuristic.timeSpent,
        })
        let noAplication = 0
        let totalWarnings = 0
        let noReply = 0
        let totalImages = 0
        let res = heuristic.heuristicQuestions.reduce(
          (totalQuestions, question) => {
            if (question.heuristicAnswer?.value === null) {
              noAplication++
            } // es para restra del total de preguntas, no suma nada al resultado
            if (
              question.heuristicAnswer?.value === '' ||
              Object.values(question.heuristicAnswer || {}).length < 3
            ) {
              noReply++
            }
            if (question.heuristicAnswer?.warning === true) {
              totalWarnings++
            }
            const images = Array.isArray(question.heuristicAnswer?.images)
              ? question.heuristicAnswer.images
              : []
            if (images.length > 0) {
              totalImages += images.length
            } else if (question.heuristicAnswer?.answerImageUrl?.trim()) {
              totalImages += 1
            }
            return totalQuestions + Number(question.heuristicAnswer?.value ?? 0)
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
          totalWarnings: totalWarnings,
          totalImages,
          timeSpentMs: parseTimeSpentToMs(heuristic.timeSpent),
        })
        heurisIndex++
      })

      console.log('[statistics] evaluator processed:', {
        userDocId: SelectEvaluator.userDocId,
        heuristicsCount: SelectEvaluator.heuristics.length,
        lastUpdate: SelectEvaluator.lastUpdate,
      })
    })

    // Sort resultEvaluator based on lastUpdate
    resultEvaluator.sort((a, b) => b.lastUpdate - a.lastUpdate)

    // Calc Final result
    resultEvaluator.forEach((ev) => {
      Object.assign(ev, calcFinalResult(ev.heuristics))
    })

    console.log('[statistics] resultEvaluator:', resultEvaluator)

    return resultEvaluator
  }
  return []
}

/**
 * Calcula estadísticas globales para la summary card a partir del array de evaluadores.
 *
 * Uso interno: Resume los datos de resultEvaluator en métricas globales de resultado y warnings.
 * Puede recibir el array explícitamente (recomendado) o usar como fallback el store.
 *
 * PARÁMETRO:
 * @param {Array} evaluatorItems - Array de evaluadores con campos result/baseWarning/maxWarning/minWarning.
 *
 * VARIABLES INTERNAS Y CÁLCULOS:
 * - toNumeric(): parseo robusto (números y strings como "75.00%")
 * - validItems: solo evaluadores con result numérico válido
 * - average/max/min/sd: métricas globales sobre result
 * - avrgWarning/avrgmaxWarning/avrgminWarning: medias globales de warnings
 * - impactWarning: diferencia entre average y avrgWarning
 *
 * RETORNA:
 * @returns {Object} Objeto con:
 *         {
 *           average,
 *           max,
 *           min,
 *           sd,
 *           maxWarning,
 *           minWarning,
 *           avrgWarning,
 *           avrgmaxWarning,
 *           avrgminWarning,
 *           impactWarning
 *         }
 *
 * Nota:
 * Si no hay evaluadores válidos, retorna los campos en null.
 */
function finalResult(
  evaluatorItems = store.state.Answer.evaluatorStatistics?.items || [],
) {
  const toNumeric = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : NaN
  }

  testData.average = null
  testData.max = null
  testData.min = null
  testData.sd = null
  warningsData.maxWarning = null
  warningsData.minWarning = null
  warningsData.avrgWarning = null
  warningsData.avrgmaxWarning = null
  warningsData.avrgminWarning = null
  warningsData.impactWarning = null

  const validItems = Array.isArray(evaluatorItems)
    ? evaluatorItems.filter((item) => Number.isFinite(toNumeric(item.result)))
    : []

  if (validItems.length) {
    const validCount = validItems.length
    const sumResult = validItems.reduce(
      (total, value) => total + toNumeric(value.result),
      0,
    )
    const sumMaxWarning = validItems.reduce(
      (total, value) => total + (toNumeric(value.maxWarning) || 0),
      0,
    )
    const sumMinWarning = validItems.reduce(
      (total, value) => total + (toNumeric(value.minWarning) || 0),
      0,
    )
    const sumBaseWarning = validItems.reduce(
      (total, value) => total + (toNumeric(value.baseWarning) || 0),
      0,
    )
    const averageResult = sumResult / validCount
    const averageMaxWarning = sumMaxWarning / validCount
    const averageMinWarning = sumMinWarning / validCount
    const averageBaseWarning = sumBaseWarning / validCount

    testData.average = `${averageResult.toFixed(2)}%`
    testData.max = `${Math.max(
      ...validItems.map((item) => toNumeric(item.result)),
    ).toFixed(2)}%`
    testData.min = `${Math.min(
      ...validItems.map((item) => toNumeric(item.result)),
    ).toFixed(2)}%`
    testData.sd = `${standardDeviation(
      validItems.map((item) => toNumeric(item.result)),
    ).toFixed(2)}%`

    warningsData.maxWarning = `${averageMaxWarning.toFixed(2)}%`
    warningsData.minWarning = `${averageMinWarning.toFixed(2)}%`
    warningsData.avrgWarning = `${averageBaseWarning.toFixed(2)}%`
    warningsData.avrgmaxWarning = warningsData.maxWarning
    warningsData.avrgminWarning = warningsData.minWarning
    warningsData.impactWarning = `${(
      averageResult - averageBaseWarning
    ).toFixed(2)}%`

    console.log('[finalResult] computed global stats:', {
      average: testData.average,
      max: testData.max,
      min: testData.min,
      sd: testData.sd,
      avrgWarning: warningsData.avrgWarning,
      avrgmaxWarning: warningsData.avrgmaxWarning,
      avrgminWarning: warningsData.avrgminWarning,
      impactWarning: warningsData.impactWarning,
      evaluators: validCount,
    })
  }
  return {
    ...testData,
    avrgWarning: warningsData.avrgWarning,
    avrgmaxWarning: warningsData.avrgmaxWarning,
    avrgminWarning: warningsData.avrgminWarning,
    impactWarning: warningsData.impactWarning,
    evaluators: validItems.length,
  }
}

/**
 * Estructura y construye tabla de EVALUADORES x HEURÍSTICAS (matriz de datos).
 *
 * Uso interno: Formatea datos SIN considerar warnings (usa statistics() results).
 * Crea una tabla donde:
 * - Filas: Cada heurística (H1, H2, H3, ...)
 * - Columnas: Cada evaluador (Ev1, Ev2, Ev3, ...) + Min/Max por heurística
 * - Celdas: Puntuación que ese evaluador dio a esa heurística
 *
 * PARÁMETROS:
 * @param {Array} resultEvaluator - Array de evaluadores con estructura:
 *        [{ userDocId, heuristics: [{id, result, totalQuestions, ...}], ... }, ...]
 *        Típicamente resultado de statistics() o store.state.Answer.evaluatorStatistics.items
 * @param {Array} testOptions - Array de opciones de respuesta:
 *        [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }]
 *        Se extrae max y min para calcular los límites por heurística
 *
 * VARIABLES INTERNAS Y ALGORITMO:
 * 1. table = { header: [...], items: [...] }
 *    - header empieza con columna 'HEURISTICS'
 *    - items será array de heurísticas procesadas
 *
 * 2. Extrae options (array de valores) y calcula max/min de la escala
 *
 * 3. Para CADA EVALUADOR (con índice evaluatorIndex):
 *    - Asigna ID: evaluator.id = 'Ev1', 'Ev2', etc.
 *    - Agrega columna al header: { text: 'Ev1', value: 'Ev1', ... }
 *    - Para CADA HEURÍSTICA del evaluador:
 *      * Busca si ya existe row en items con esa heurística.id
 *      * Si existe: actualiza fila[evaluator.id] = heuristic.result
 *      * Si NO existe: crea nueva fila con estructura:
 *        {
 *          heuristic: 'H1',  // ID de la heurística
 *          max: 4 * 10,      // Puntuación máxima teórica (maxValue * totalQuestions)
 *          min: 0 * 10,      // Puntuación mínima teórica (minValue * totalQuestions)
 *          'Ev1': 35,        // Puntuación que Ev1 le dio a H1
 *          'Ev2': 38,        // Puntuación que Ev2 le dio a H1
 *          ...
 *        }
 *
 * RETORNA:
 * @returns {Object} Tabla formateada para mostrar en UI (típicamente Vuetify DataTable):
 *         {
 *           header: [
 *             { title: 'HEURISTICS', align: 'start', value: 'heuristic' },
 *             { text: 'Ev1', align: 'center', value: 'Ev1' },
 *             { text: 'Ev2', align: 'center', value: 'Ev2' },
 *             { text: 'Ev3', align: 'center', value: 'Ev3' }
 *           ],
 *           items: [
 *             { heuristic: 'H1', max: 40, min: 0, Ev1: 35, Ev2: 38, Ev3: 32 },
 *             { heuristic: 'H2', max: 40, min: 0, Ev1: 36, Ev2: 39, Ev3: 31 },
 *             { heuristic: 'H3', max: 40, min: 0, Ev1: 34, Ev2: 37, Ev3: 30 }
 *           ]
 *         }
 *
 * EN LA VISTA:
 * Se renderiza típicamente en un componente DataTable/VDataTable:
 * - Permite ver a simple vista qué heurística fue evaluada por cada persona
 * - Y qué puntuación relativamente le dió cada uno
 * - Min/Max columnas permiten visualizar rango esperado
 */
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

/**
 * Calcula ESTADÍSTICAS POR HEURÍSTICA a partir de la tabla de evaluadores.
 *
 * Uso interno: Transforma table de buildHeuristicsEvaluator() en tabla de estadísticas resumidas.
 * Para CADA heurística, calcula: average, sd, min, max, percentage entre todos los evaluadores.
 * Permite ver "¿Cómo fue evaluado en promedio cada heurístico?"
 *
 * PARÁMETRO:
 * @param {Object} heuristicsEvaluator - Tabla output de buildHeuristicsEvaluator():
 *        {
 *          header: [...],
 *          items: [
 *            { heuristic: 'H1', max: 40, min: 0, Ev1: 35, Ev2: 38, Ev3: 32 },
 *            { heuristic: 'H2', max: 40, min: 0, Ev1: 36, Ev2: 39, Ev3: 31 }
 *          ]
 *        }
 *
 * VARIABLES INTERNAS Y ALGORITMO:
 * 1. Crea tabla con 6 columnas: heuristic, percentage, sd, average, max, min
 *    (típicamente para mostrar en DataTable)
 *
 * 2. Para CADA item (heurística) en heuristicsEvaluator.items:
 *    a) results = Extrae TODOS los valores de 'Ev1', 'Ev2', 'Ev3', etc.
 *       (filtering por key.includes('Ev') para excluir heuristic/max/min)
 *       Filtra nulls/undefined
 *
 *    b) average = Promedio de los valores de evaluadores
 *       Formula: Σ(Ev1 + Ev2 + Ev3) / cantidad_evaluadores
 *
 *    c) percentage = Normaliza average a escala 0-100% respecto a min/max posible
 *       Formula: ((average - min) / (max - min)) * 100
 *       Si max === min => '0.00' (evita división 0)
 *       Ejemplo: Si average=35, min=0, max=40 => (35-0)/(40-0)*100 = 87.50%
 *
 *    d) sd = Desviación estándar de los valores de evaluadores
 *       Usa función standardDeviation(results)
 *       Indica cuánto variaron las evaluaciones entre evaluadores
 *       Bajo = validación fuerte (evaluadores de acuerdo)
 *       Alto = validación débil (evaluadores discrepan)
 *
 *    e) max/min = Toma directamente de item.max/item.min
 *       (límites teóricos de la escala * cantidad de preguntas)
 *
 * RETORNA:
 * @returns {Object} Tabla de estadísticas heurísticas:
 *         {
 *           header: [
 *             { title: 'HEURISTICS', value: 'name' },
 *             { title: 'Percentage (%)', value: 'percentage' },
 *             { title: 'Standard deviation', value: 'sd' },
 *             { title: 'Average', value: 'average' },
 *             { title: 'Max', value: 'max' },
 *             { title: 'Min', value: 'min' }
 *           ],
 *           items: [
 *             {
 *               name: 'H1',
 *               max: '40.00',          // Puntuación máxima teórica
 *               min: '0.00',           // Puntuación mínima teórica
 *               percentage: '87.50',   // Normalizado 0-100
 *               sd: '2.50',            // Desviación estándar between evaluators
 *               average: '35.00'       // Promedio de Ev1, Ev2, Ev3, etc
 *             },
 *             { name: 'H2', max: '40.00', min: '0.00', percentage: '90.00', sd: '3.00', average: '36.00' },
 *             { name: 'H3', max: '40.00', min: '0.00', percentage: '82.50', sd: '2.00', average: '33.00' }
 *           ]
 *         }
 *
 * EN LA VISTA:
 * Se muestra en tabla resumen de "Heuristics Statistics":
 * - HEURISTICS | Percentage | SD | Average | Max | Min
 * - H1         | 87.50%     | 2.50 | 35.00 | 40.00 | 0.00
 * - H2         | 90.00%     | 3.00 | 36.00 | 40.00 | 0.00
 * - H3         | 82.50%     | 2.00 | 33.00 | 40.00 | 0.00
 *
 * NOTA: Un SD bajo en una heurística significa que los evaluadores están alineados (validación fuerte).
 *       Un SD alto significa discrepancia entre evaluadores (tal vez la heurística es ambigua).
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
  parseTimeSpentToMs,
  formatTimeSpentFromMs,
}
