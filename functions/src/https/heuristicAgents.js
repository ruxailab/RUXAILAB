import dns from 'node:dns/promises'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import net from 'node:net'
import puppeteer from 'puppeteer-core'
import { admin, functions } from '../f.firebase.js'

const MAX_HTML_BYTES = 1_000_000
const MAX_TREE_CHARS = 500_000
// Keep structured responses comfortably below the model output limit. Each
// decision includes a comment and evidence, so batches of eight could exhaust
// 2,400 tokens and leave an incomplete JSON document (finish_reason=length).
const MAX_COMPLETION_TOKENS = 4_000
const QUESTIONS_PER_BATCH = 4
const SINGLE_QUESTION_RETRIES = 2
const FALLBACK_QUESTION_CONCURRENCY = 2
const MAX_SCREENSHOTS_PER_EVALUATION = 6
const MAX_SCREENSHOT_SELECTOR_LENGTH = 500
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
]
const resolveBrowserRuntime = async () => {
  const localExecutable =
    process.env.CHROME_EXECUTABLE_PATH || LOCAL_CHROME_PATHS.find(existsSync)
  if (localExecutable) {
    return {
      executablePath: localExecutable,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  }
  const { default: chromium } = await import('@sparticuz/chromium')
  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
  }
}
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const fail = (code, message) => {
  throw new functions.https.HttpsError(code, message)
}

const getOpenRouterConfig = () => {
  const apiKey =
    process.env.AGENTS_RESPONSE_OPENROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    fail(
      'failed-precondition',
      'AGENTS_RESPONSE_OPENROUTER_API_KEY no está configurada en Functions.',
    )
  }
  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4.1-mini',
  }
}

const openRouterHeaders = (apiKey) => ({
  authorization: `Bearer ${apiKey}`,
  'content-type': 'application/json',
  ...(process.env.SITE_URL ? { 'HTTP-Referer': process.env.SITE_URL } : {}),
  'X-OpenRouter-Title': 'RUXAILAB',
})

const stripMarkdownFence = (content) => {
  const trimmed = content.trim()
  if (!trimmed.startsWith('```')) return trimmed

  let body = trimmed.slice(3)
  if (body.toLowerCase().startsWith('json')) body = body.slice(4)
  body = body.trimStart()
  if (body.endsWith('```')) body = body.slice(0, -3)
  return body.trim()
}

const parseJsonContent = (content) => {
  if (typeof content !== 'string') return null
  const withoutFence = stripMarkdownFence(content)
  const candidates = [withoutFence]
  const firstBrace = withoutFence.indexOf('{')
  const lastBrace = withoutFence.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(withoutFence.slice(firstBrace, lastBrace + 1))
  }
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      // Try the next safe extraction.
    }
  }
  return null
}

const isValidMetric = (value) =>
  Number.isInteger(value) && value >= 0 && value <= 4

const isDecisionAnswerValid = (decision, validAnswers, answerMode) => {
  switch (answerMode) {
    case 'customOptions':
      return validAnswers.has(String(decision?.answer))
    case 'frequency':
      return isValidMetric(decision?.frequency)
    case 'severity':
      return isValidMetric(decision?.severity)
    case 'frequencySeverity':
      return (
        isValidMetric(decision?.frequency) &&
        isValidMetric(decision?.severity)
      )
    default:
      return false
  }
}

const validateDecisions = (decisions, questions, options, answerMode) => {
  if (!Array.isArray(decisions)) return false
  const expected = new Set(
    questions.map(
      (question) => `${question.heuristicId}:${question.questionId}`,
    ),
  )
  const validAnswers = new Set(
    options.map((option) => String(option?.value ?? option)),
  )
  const received = new Set()
  for (const decision of decisions) {
    const key = `${decision?.heuristicId}:${decision?.questionId}`
    if (
      !expected.has(key) ||
      received.has(key) ||
      !isDecisionAnswerValid(decision, validAnswers, answerMode)
    ) {
      return false
    }
    received.add(key)
  }
  return received.size === expected.size
}

const extractDecisionArray = (result, expectedCount) => {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return null
  if (Array.isArray(result.decisions)) return result.decisions
  // Some OpenRouter routes ignore the requested wrapper for a single item and
  // return the decision object directly. Do not mistake `evidence` for the
  // decisions array.
  if (
    expectedCount === 1 &&
    'heuristicId' in result &&
    'questionId' in result
  ) {
    return [result]
  }
  return (
    Object.values(result).find(
      (value) =>
        Array.isArray(value) &&
        value.length === expectedCount &&
        value.every((item) => item && typeof item === 'object'),
    ) || null
  )
}

const normalizeDecisions = (rawDecisions, questions, options, answerMode) => {
  if (
    !Array.isArray(rawDecisions) ||
    rawDecisions.length !== questions.length
  ) {
    return rawDecisions
  }

  return rawDecisions.map((rawDecision, index) => {
    const decision =
      rawDecision && typeof rawDecision === 'object' ? rawDecision : {}
    const nestedAnswer =
      decision.answer && typeof decision.answer === 'object'
        ? decision.answer
        : {}
    const normalized = {
      ...decision,
      heuristicId: questions[index].heuristicId,
      questionId: questions[index].questionId,
      comment: String(decision.comment || decision.reason || ''),
      evidence: Array.isArray(decision.evidence)
        ? decision.evidence.map(String).slice(0, 3)
        : [],
      screenshotSelector:
        typeof decision.screenshotSelector === 'string'
          ? decision.screenshotSelector
              .trim()
              .slice(0, MAX_SCREENSHOT_SELECTOR_LENGTH)
          : '',
    }

    if (answerMode === 'customOptions') {
      const rawValue = nestedAnswer.value ?? decision.answer
      const option = options.find(
        (item) => String(item?.value ?? item) === String(rawValue),
      )
      normalized.answer = option?.value ?? option ?? rawValue
    }
    if (answerMode === 'frequency' || answerMode === 'frequencySeverity') {
      normalized.frequency = Number(
        decision.frequency ?? nestedAnswer.frequency,
      )
    }
    if (answerMode === 'severity' || answerMode === 'frequencySeverity') {
      normalized.severity = Number(decision.severity ?? nestedAnswer.severity)
    }
    return normalized
  })
}

const usesFrequency = (answerMode) =>
  answerMode === 'frequency' || answerMode === 'frequencySeverity'

const usesSeverity = (answerMode) =>
  answerMode === 'severity' || answerMode === 'frequencySeverity'

const buildAnswerSchema = (options, answerMode) => {
  const answerValues = options.map((option) => option?.value ?? option)
  if (answerMode === 'customOptions') {
    return {
      properties: { answer: { enum: answerValues } },
      required: ['answer'],
    }
  }

  const properties = {}
  const required = []
  if (usesFrequency(answerMode)) {
    properties.frequency = { type: 'integer', minimum: 0, maximum: 4 }
    required.push('frequency')
  }
  if (usesSeverity(answerMode)) {
    properties.severity = { type: 'integer', minimum: 0, maximum: 4 }
    required.push('severity')
  }
  return { properties, required }
}

const buildResponseSchema = (questions, options, answerMode) => {
  const heuristicIds = [
    ...new Set(questions.map((question) => question.heuristicId)),
  ]
  const questionIds = [
    ...new Set(questions.map((question) => question.questionId)),
  ]
  const answerSchema = buildAnswerSchema(options, answerMode)
  return {
    name: 'heuristic_decisions',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        decisions: {
          type: 'array',
          minItems: questions.length,
          maxItems: questions.length,
          items: {
            type: 'object',
            properties: {
              heuristicId: { enum: heuristicIds },
              questionId: { enum: questionIds },
              ...answerSchema.properties,
              comment: { type: 'string' },
              evidence: {
                type: 'array',
                maxItems: 3,
                items: { type: 'string' },
              },
              screenshotSelector: {
                type: 'string',
                maxLength: MAX_SCREENSHOT_SELECTOR_LENGTH,
              },
            },
            required: [
              'heuristicId',
              'questionId',
              ...answerSchema.required,
              'comment',
              'evidence',
              'screenshotSelector',
            ],
            additionalProperties: false,
          },
        },
      },
      required: ['decisions'],
      additionalProperties: false,
    },
  }
}

const buildOpenRouterRequest = ({
  agent,
  apiKey,
  model,
  page,
  questions,
  options,
  answerMode,
}) => {
  const responseSchema = buildResponseSchema(questions, options, answerMode)
  return {
    method: 'POST',
    headers: openRouterHeaders(apiKey),
    body: JSON.stringify({
      model,
      temperature: agent.temperature ?? 0.2,
      max_tokens: MAX_COMPLETION_TOKENS,
      response_format: {
        type: 'json_schema',
        json_schema: responseSchema,
      },
      messages: [
        {
          role: 'system',
          content: `${agent.systemPrompt || 'Actúa como evaluador experto en usabilidad.'}\nResponde únicamente con el JSON exigido por el esquema. Conserva exactamente los heuristicId y questionId recibidos y crea una sola decisión por pregunta. El modo de respuesta es "${answerMode}". Si es customOptions, usa en answer únicamente uno de los valores proporcionados en options. Para frequency o severity usa una escala entera de 0 a 4 y completa solo los campos exigidos por el esquema. Basa toda afirmación en evidencias del árbol web. Sé conciso: limita comment a dos frases y evidence a un máximo de tres fragmentos breves por pregunta. Usa screenshotSelector solo cuando una captura aporte evidencia visual necesaria para validar el comentario; debe ser un selector CSS específico construible con los atributos del árbol web. En caso contrario devuelve una cadena vacía.`,
        },
        {
          role: 'user',
          content: JSON.stringify({ page, questions, options, answerMode }),
        },
      ],
    }),
  }
}

const requestOpenRouter = async (openRouterRequest) => {
  let response
  let errorPayload = null
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      openRouterRequest,
    )
    if (response.ok) return { response, errorPayload }

    const details = await response.text()
    try {
      errorPayload = JSON.parse(details)
    } catch {
      errorPayload = { error: { message: details } }
    }
    console.error('AI provider error', response.status, details.slice(0, 1000))

    const errorType = errorPayload?.error?.type || errorPayload?.error?.code
    if (response.status !== 429 || errorType === 'insufficient_quota') break
    if (attempt < 2) await wait(1000 * 2 ** attempt)
  }
  return { response, errorPayload }
}

const handleOpenRouterError = (response, errorPayload) => {
  if (response.ok) return
  const errorType = errorPayload?.error?.type || errorPayload?.error?.code || ''
  if (response.status === 429 && errorType === 'insufficient_quota') {
    fail(
      'resource-exhausted',
      'La cuenta de OpenRouter no tiene crédito disponible. Añade saldo o revisa los límites de tu API key.',
    )
  }
  if (response.status === 429) {
    fail(
      'resource-exhausted',
      'OpenRouter ha alcanzado el límite temporal de peticiones o tokens. Espera unos minutos o revisa los límites de tu API key.',
    )
  }
  fail(
    'unavailable',
    errorPayload?.error?.message ||
      `El proveedor de IA respondió con HTTP ${response.status}.`,
  )
}

const parseOpenRouterResult = async (response, model) => {
  const payload = await response.json()
  const choice = payload.choices?.[0]
  const result = parseJsonContent(choice?.message?.content)
  if (result) return { choice, result }

  console.error('Invalid AI JSON response', {
    model,
    finishReason: choice?.finish_reason || null,
    contentLength: choice?.message?.content?.length || 0,
  })
  if (choice?.finish_reason === 'length') {
    fail(
      'resource-exhausted',
      'Una parte de la evaluación fue truncada. Reduce el tamaño del árbol web o utiliza un modelo con más capacidad.',
    )
  }
  fail(
    'data-loss',
    'El proveedor devolvió una respuesta que no es JSON válido.',
  )
}

const getResponseKeys = (result) => {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return []
  return Object.keys(result).slice(0, 10)
}

const requestQuestionBatch = async ({
  agent,
  apiKey,
  model,
  page,
  questions,
  options,
  answerMode,
}) => {
  const openRouterRequest = {
    ...buildOpenRouterRequest({
      agent,
      apiKey,
      model,
      page,
      questions,
      options,
      answerMode,
    }),
  }
  const { response, errorPayload } = await requestOpenRouter(openRouterRequest)
  handleOpenRouterError(response, errorPayload)
  const { choice, result } = await parseOpenRouterResult(response, model)
  const decisions = normalizeDecisions(
    extractDecisionArray(result, questions.length),
    questions,
    options,
    answerMode,
  )
  if (!validateDecisions(decisions, questions, options, answerMode)) {
    console.error('Incomplete AI decisions', {
      model,
      expected: questions.length,
      received: Array.isArray(decisions) ? decisions.length : null,
      responseKeys: getResponseKeys(result),
      finishReason: choice?.finish_reason || null,
    })
    fail(
      'data-loss',
      'La respuesta no contiene una opción válida para cada pregunta heurística.',
    )
  }
  return decisions
}

const isRecoverableModelError = (error) =>
  error instanceof functions.https.HttpsError &&
  ['data-loss', 'resource-exhausted'].includes(error.code)

const evaluateSingleQuestion = async (context) => {
  let lastError
  for (let attempt = 0; attempt <= SINGLE_QUESTION_RETRIES; attempt += 1) {
    try {
      return await requestQuestionBatch(context)
    } catch (error) {
      lastError = error
      if (!isRecoverableModelError(error) || attempt === SINGLE_QUESTION_RETRIES)
        throw error
      await wait(500 * 2 ** attempt)
    }
  }
  throw lastError
}

const evaluateQuestionsIndividually = async (context) => {
  const results = new Array(context.questions.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < context.questions.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await evaluateSingleQuestion({
        ...context,
        questions: [context.questions[index]],
      })
    }
  }
  const workerCount = Math.min(
    FALLBACK_QUESTION_CONCURRENCY,
    context.questions.length,
  )
  await Promise.all(Array.from({ length: workerCount }, worker))
  return results.flat()
}

const evaluateQuestionBatch = async (context) => {
  try {
    return await requestQuestionBatch(context)
  } catch (error) {
    if (!isRecoverableModelError(error)) throw error
    if (context.questions.length === 1) {
      return evaluateSingleQuestion(context)
    }
    console.warn('Retrying invalid AI batch as individual questions', {
      count: context.questions.length,
      reason: error.message,
    })
    return evaluateQuestionsIndividually(context)
  }
}

const isPrivateIp = (address) => {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number)
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    )
  }
  const normalized = address.toLowerCase()
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  )
}

const validatePublicUrl = async (rawUrl) => {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    fail('invalid-argument', 'La URL no es válida.')
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    fail('invalid-argument', 'Solo se permiten URLs HTTP o HTTPS.')
  }
  if (url.username || url.password) {
    fail('invalid-argument', 'La URL no puede contener credenciales.')
  }
  const addresses = await dns.lookup(url.hostname, { all: true })
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateIp(address))
  ) {
    fail('permission-denied', 'No se permiten destinos privados o locales.')
  }
  return url
}

const getAuthorizedTest = async (testId, uid) => {
  const snapshot = await admin.firestore().collection('tests').doc(testId).get()
  if (!snapshot.exists) fail('not-found', 'El test no existe.')
  const test = snapshot.data()
  const isAdmin = test.testAdmin?.userDocId === uid
  const isCooperator = (test.cooperators || []).some(
    (item) => item.userDocId === uid && item.accepted === true,
  )
  if (!isAdmin && !isCooperator)
    fail('permission-denied', 'No tienes acceso al test.')
  return test
}

const fetchPage = async (rawUrl) => {
  const target = await validatePublicUrl(rawUrl)
  const browserRuntime = await resolveBrowserRuntime()
  let browser
  try {
    browser = await puppeteer.launch({
      args: browserRuntime.args,
      defaultViewport: { width: 1440, height: 1000 },
      executablePath: browserRuntime.executablePath,
      headless: true,
    })
    const page = await browser.newPage()
    const allowedHosts = new Map()
    await page.setRequestInterception(true)
    page.on('request', async (request) => {
      const requestUrl = request.url()
      if (/^(data|blob):/.test(requestUrl)) {
        request.continue()
        return
      }
      try {
        const parsed = new URL(requestUrl)
        if (!allowedHosts.has(parsed.hostname)) {
          await validatePublicUrl(parsed.href)
          allowedHosts.set(parsed.hostname, true)
        }
        request.continue()
      } catch {
        request.abort('blockedbyclient')
      }
    })
    const response = await page.goto(target.href, {
      waitUntil: 'domcontentloaded',
      timeout: 25_000,
    })
    if (!response)
      fail('unavailable', 'La web no devolvió una respuesta navegable.')
    if (!response.ok())
      fail('unavailable', `La web respondió con HTTP ${response.status()}.`)

    await page
      .waitForNetworkIdle({ idleTime: 750, timeout: 8_000 })
      .catch(() => {})
    await page
      .waitForFunction(
        () => {
          const app = document.querySelector('#app')
          return (
            !app || app.children.length > 0 || app.textContent.trim().length > 0
          )
        },
        { timeout: 10_000 },
      )
      .catch(() => {})

    const html = await page.content()
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
      fail(
        'resource-exhausted',
        'La página renderizada supera el tamaño máximo permitido.',
      )
    }
    return { html, finalUrl: page.url(), rendered: true }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error
    console.error('Browser rendering failed', error)
    fail('unavailable', `No se pudo renderizar la página: ${error.message}`)
  } finally {
    await browser?.close()
  }
}

const safeStorageSegment = (value) =>
  String(value ?? 'unknown')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 100)

const uploadEvidenceScreenshot = async ({
  buffer,
  testId,
  agentId,
  decision,
}) => {
  const bucket = admin.storage().bucket()
  const token = randomUUID()
  const fileName = `${Date.now()}-${randomUUID()}.png`
  const storagePath = [
    'tests',
    safeStorageSegment(testId),
    `heuristic_ai_${safeStorageSegment(agentId)}`,
    `${safeStorageSegment(decision.heuristicId)}-${safeStorageSegment(decision.questionId)}`,
    fileName,
  ].join('/')
  await bucket.file(storagePath).save(buffer, {
    resumable: false,
    metadata: {
      contentType: 'image/png',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })
  const url =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${token}`
  return { url, storagePath, size: buffer.length }
}

/** Captures only evidence explicitly requested by the model, without failing the evaluation. */
const attachEvidenceScreenshots = async ({
  decisions,
  pageUrl,
  testId,
  agentId,
}) => {
  const candidates = decisions
    .filter((decision) => decision.screenshotSelector)
    .slice(0, MAX_SCREENSHOTS_PER_EVALUATION)
  if (!candidates.length || !pageUrl) return decisions

  let browser
  try {
    const target = await validatePublicUrl(pageUrl)
    const browserRuntime = await resolveBrowserRuntime()
    browser = await puppeteer.launch({
      args: browserRuntime.args,
      defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
      executablePath: browserRuntime.executablePath,
      headless: true,
    })
    const browserPage = await browser.newPage()
    const allowedHosts = new Map()
    await browserPage.setRequestInterception(true)
    browserPage.on('request', async (interceptedRequest) => {
      const requestUrl = interceptedRequest.url()
      if (/^(data|blob):/.test(requestUrl)) {
        interceptedRequest.continue()
        return
      }
      try {
        const parsed = new URL(requestUrl)
        if (!allowedHosts.has(parsed.hostname)) {
          await validatePublicUrl(parsed.href)
          allowedHosts.set(parsed.hostname, true)
        }
        interceptedRequest.continue()
      } catch {
        interceptedRequest.abort('blockedbyclient')
      }
    })
    await browserPage.goto(target.href, {
      waitUntil: 'domcontentloaded',
      timeout: 25_000,
    })
    await browserPage
      .waitForNetworkIdle({ idleTime: 750, timeout: 8_000 })
      .catch(() => {})

    for (const decision of candidates) {
      try {
        const element = await browserPage.$(decision.screenshotSelector)
        if (!element) continue
        await element.scrollIntoView()
        const buffer = await element.screenshot({ type: 'png' })
        const uploaded = await uploadEvidenceScreenshot({
          buffer,
          testId,
          agentId,
          decision,
        })
        decision.screenshot = {
          ...uploaded,
          selector: decision.screenshotSelector,
          createdAt: Date.now(),
        }
      } catch (error) {
        console.warn('AI evidence screenshot skipped', {
          selector: decision.screenshotSelector,
          message: error.message,
        })
      }
    }
  } catch (error) {
    console.warn('AI evidence capture unavailable', error.message)
  } finally {
    await browser?.close()
  }
  return decisions
}

export const fetchHeuristicPage = functions.onCall({
  options: { timeoutSeconds: 60, memory: '1GiB' },
  handler: async (request) => {
    if (!request.auth) fail('unauthenticated', 'Debes iniciar sesión.')
    const { url, testId } = request.data || {}
    if (!url || !testId)
      fail('invalid-argument', 'URL y testId son obligatorios.')
    await getAuthorizedTest(testId, request.auth.uid)
    return fetchPage(url)
  },
})

export const evaluateHeuristicPage = functions.onCall({
  options: { timeoutSeconds: 300, memory: '1GiB' },
  handler: async (request) => {
    if (!request.auth) fail('unauthenticated', 'Debes iniciar sesión.')
    const { agentId, testId, page, questions, options, answerMode } =
      request.data || {}
    if (
      !agentId ||
      !testId ||
      !page ||
      !Array.isArray(questions) ||
      !['customOptions', 'frequency', 'severity', 'frequencySeverity'].includes(
        answerMode,
      )
    ) {
      fail('invalid-argument', 'Faltan datos para realizar la evaluación.')
    }

    const test = await getAuthorizedTest(testId, request.auth.uid)
    if (!(test.heuristicAgentIds || []).includes(agentId)) {
      fail('failed-precondition', 'El agente no está activo en este test.')
    }
    const agentSnapshot = await admin
      .firestore()
      .collection('agents')
      .doc(agentId)
      .get()
    if (!agentSnapshot.exists) fail('not-found', 'El agente no existe.')
    const agent = agentSnapshot.data()
    const canUse =
      agent.ownerId === request.auth.uid ||
      agent.visibility === 'public' ||
      (agent.visibility === 'shared' &&
        (agent.sharedWith || []).includes(request.auth.uid))
    if (!canUse) fail('permission-denied', 'No puedes utilizar este agente.')

    const { apiKey, model: defaultModel } = getOpenRouterConfig()
    const configuredModel =
      process.env.OPENROUTER_FORCE_MODEL || agent.model || defaultModel
    // Agents created by the previous OpenAI-only UI stored an unqualified
    // model name. OpenRouter model IDs normally include their author.
    const model = configuredModel.includes('/')
      ? configuredModel
      : `openai/${configuredModel}`
    const serializedPage = JSON.stringify(page)
    if (serializedPage.length > MAX_TREE_CHARS) {
      fail('resource-exhausted', 'El árbol web es demasiado grande.')
    }

    const decisions = []
    for (
      let index = 0;
      index < questions.length;
      index += QUESTIONS_PER_BATCH
    ) {
      const batch = questions.slice(index, index + QUESTIONS_PER_BATCH)
      decisions.push(
        ...(await evaluateQuestionBatch({
          agent,
          apiKey,
          model,
          page,
          questions: batch,
          options: options || [],
          answerMode,
        })),
      )
    }

    if (!validateDecisions(decisions, questions, options || [], answerMode)) {
      fail(
        'data-loss',
        'No se pudieron reunir todas las respuestas del agente.',
      )
    }
    await attachEvidenceScreenshots({
      decisions,
      pageUrl: page.url,
      testId,
      agentId,
    })
    return { decisions, model }
  },
})
