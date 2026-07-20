import OpenAI from 'openai'
import { functions } from '../f.firebase.js'
import { buildSystemPrompt } from '../ai/studyGeneration/systemPrompt.js'
import { studyDraftJsonSchema } from '../ai/studyGeneration/responseSchema.js'
import {
  finalizeStudyDraft,
  mergeUsage,
} from '../ai/studyGeneration/finalizeStudyDraft.js'

const error = (code, message) => new functions.https.HttpsError(code, message)

const SUPPORTED_METHODS = [
  'CARD_SORTING',
  'USER',
  'HEURISTIC',
  'FOCUS_GROUP',
]
const MAX_MESSAGES = 12
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 8
const DEFAULT_MODEL =
  process.env.OPENROUTER_STUDY_MODEL ||
  process.env.STUDY_AI_MODEL ||
  'tencent/hy3:free'
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'

/** @type {Map<string, number[]>} */
const rateLimitBuckets = new Map()

/**
 * @param {string} stage
 * @param {object} [context]
 * @param {number} [startedAt]
 */
function logStage(stage, context = {}, startedAt = null) {
  const payload = {
    stage,
    ...context,
  }
  if (startedAt != null) {
    payload.elapsedMs = Date.now() - startedAt
  }
  console.log('[generateStudyDraft]', payload)
}

/**
 * @param {string} uid
 */
function assertRateLimit(uid) {
  const now = Date.now()
  const timestamps = (rateLimitBuckets.get(uid) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  )
  if (timestamps.length >= RATE_LIMIT_MAX) {
    throw error(
      'resource-exhausted',
      'Too many study generation requests. Try again shortly.',
    )
  }
  timestamps.push(now)
  rateLimitBuckets.set(uid, timestamps)
}

/**
 * @param {unknown} messages
 * @returns {Array<{ role: string, text: string }>}
 */
function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1) {
    throw error('invalid-argument', 'messages must be a non-empty array')
  }

  const cleaned = messages
    .filter(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'model') &&
        typeof message.text === 'string' &&
        message.text.trim() !== '',
    )
    .map((message) => ({
      role: message.role,
      text: String(message.text).slice(0, 4000),
    }))
    .slice(-MAX_MESSAGES)

  if (cleaned.length < 1) {
    throw error(
      'invalid-argument',
      'messages must contain valid user/model entries',
    )
  }

  if (cleaned[cleaned.length - 1].role !== 'user') {
    throw error('invalid-argument', 'Last message must be from the user')
  }

  return cleaned
}

/**
 * @param {Array<{ role: string, text: string }>} messages
 * @param {string} systemPrompt
 */
function toOpenAIMessages(messages, systemPrompt) {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.map((message) => ({
      role: message.role === 'model' ? 'assistant' : 'user',
      content: message.text,
    })),
  ]
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
function isResponseFormatUnsupported(err) {
  const message = String(err?.message || '').toLowerCase()
  return (
    err?.status === 400 ||
    message.includes('400') ||
    message.includes('response_format') ||
    message.includes('json_schema') ||
    message.includes('provider returned error')
  )
}

/**
 * Calls OpenRouter via the OpenAI SDK.
 * Tries json_schema first; falls back to json_object for providers that reject schema.
 *
 * @param {{
 *   apiKey: string,
 *   modelName: string,
 *   systemPrompt: string,
 *   messages: Array<{ role: string, text: string }>,
 *   stagePrefix?: string,
 * }} params
 */
async function callOpenRouterChatCompletion({
  apiKey,
  modelName,
  systemPrompt,
  messages,
  stagePrefix = 'openrouter',
}) {
  const requestStartedAt = Date.now()
  const client = new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    timeout: 45_000,
  })

  const openAIMessages = toOpenAIMessages(messages, systemPrompt)

  logStage(`${stagePrefix}_request_start`, {
    modelName,
    baseURL: OPENROUTER_BASE_URL,
    messagesCount: openAIMessages.length,
    systemPromptChars: systemPrompt.length,
  })

  const run = async (responseFormat) =>
    client.chat.completions.create({
      model: modelName,
      temperature: 0.3,
      messages: openAIMessages,
      response_format: responseFormat,
    })

  let completion
  try {
    completion = await run({
      type: 'json_schema',
      json_schema: {
        name: 'StudyDraft',
        strict: false,
        schema: studyDraftJsonSchema,
      },
    })
  } catch (schemaErr) {
    if (!isResponseFormatUnsupported(schemaErr)) throw schemaErr
    logStage(`${stagePrefix}_schema_fallback`, {
      message: schemaErr?.message,
    })
    completion = await run({ type: 'json_object' })
  }

  const choice = completion?.choices?.[0]
  const text = choice?.message?.content || ''

  logStage(
    `${stagePrefix}_http_response`,
    {
      finishReason: choice?.finish_reason || null,
      responseChars: text.length,
      promptTokens: completion?.usage?.prompt_tokens,
      completionTokens: completion?.usage?.completion_tokens,
    },
    requestStartedAt,
  )

  if (!text) {
    throw new Error('OpenRouter returned an empty completion')
  }

  return {
    text,
    usage: completion?.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          candidatesTokens: completion.usage.completion_tokens,
        }
      : undefined,
  }
}

/**
 * Callable: generateStudyDraft
 * Generic for CARD_SORTING | USER | HEURISTIC | FOCUS_GROUP
 * Pipeline: generate → normalize → validate → repair → revalidate → clarification
 */
export const generateStudyDraft = functions.onCall({
  options: {
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  handler: async (request) => {
    const startedAt = Date.now()
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    logStage('start', {
      uid,
      model: DEFAULT_MODEL,
      hasApiKey: Boolean(process.env.OPENROUTER_API_KEY),
      locale: request?.data?.locale || 'en-US',
      preferredMethod: request?.data?.preferredMethod || null,
      rawMessagesCount: Array.isArray(request?.data?.messages)
        ? request.data.messages.length
        : 0,
    })

    assertRateLimit(uid)
    logStage('rate_limit_ok', { uid }, startedAt)

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw error('failed-precondition', 'OPENROUTER_API_KEY is not configured')
    }

    const locale = request?.data?.locale || 'en-US'
    const preferredMethod = request?.data?.preferredMethod || null
    if (
      preferredMethod != null &&
      !SUPPORTED_METHODS.includes(preferredMethod)
    ) {
      throw error('invalid-argument', 'preferredMethod is invalid')
    }

    const messages = sanitizeMessages(request?.data?.messages)
    logStage(
      'messages_sanitized',
      {
        messagesCount: messages.length,
        lastRole: messages[messages.length - 1]?.role,
        lastTextChars: messages[messages.length - 1]?.text?.length || 0,
      },
      startedAt,
    )

    const modelName = DEFAULT_MODEL
    const systemPrompt = buildSystemPrompt({ locale, preferredMethod })
    const latestUserText =
      [...messages].reverse().find((message) => message.role === 'user')
        ?.text || ''

    try {
      logStage('before_generate_call', { modelName }, startedAt)
      const generateResult = await callOpenRouterChatCompletion({
        apiKey,
        modelName,
        systemPrompt,
        messages,
        stagePrefix: 'generate',
      })
      logStage(
        'after_generate_call',
        { responseChars: generateResult.text?.length || 0 },
        startedAt,
      )

      let parsed
      try {
        parsed = JSON.parse(generateResult.text)
      } catch (parseErr) {
        logStage(
          'generate_parse_failed',
          {
            message: parseErr?.message,
            preview: String(generateResult.text || '').slice(0, 200),
          },
          startedAt,
        )
        throw error('internal', 'Failed to parse model JSON response')
      }

      const finalized = await finalizeStudyDraft({
        parsed,
        locale,
        userText: latestUserText,
        repairFn: ({ systemPrompt: repairSystem, messages: repairMessages }) =>
          callOpenRouterChatCompletion({
            apiKey,
            modelName,
            systemPrompt: repairSystem,
            messages: repairMessages,
            stagePrefix: 'repair',
          }),
        log: (stage, context) => logStage(stage, context, startedAt),
      })

      const usage = mergeUsage([
        generateResult.usage,
        ...(finalized.usageParts || []),
      ])

      logStage(
        'success',
        {
          testType: finalized.draft?.testType,
          clarificationNeeded: finalized.draft?.clarificationNeeded,
          repaired: finalized.repaired,
        },
        startedAt,
      )

      return {
        draft: finalized.draft,
        model: modelName,
        usage,
      }
    } catch (err) {
      if (err instanceof functions.https.HttpsError) {
        logStage(
          'https_error',
          { code: err.code, message: err.message },
          startedAt,
        )
        throw err
      }
      console.error('[generateStudyDraft] failed', {
        uid,
        stage: 'unhandled',
        code: err?.status || err?.code || err?.name,
        message: err?.message,
        elapsedMs: Date.now() - startedAt,
      })
      throw error(
        'internal',
        err?.message
          ? `Study draft generation failed: ${err.message}`
          : 'Study draft generation failed',
      )
    }
  },
})
