import OpenAI from 'openai'
import { functions } from '../f.firebase.js'
import { buildSystemPrompt } from '../ai/studyGeneration/systemPrompt/index.js'
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
const DEFAULT_MODEL = process.env.CHAT_BUILDER_OPENROUTER_STUDY_MODEL
const OPENROUTER_BASE_URL = process.env.CHAT_BUILDER_OPENROUTER_BASE_URL

/** @type {Map<string, number[]>} */
const rateLimitBuckets = new Map()

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
 * }} params
 */
async function callOpenRouterChatCompletion({
  apiKey,
  modelName,
  systemPrompt,
  messages,
}) {
  const requestStartedAt = Date.now()
  const client = new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    timeout: 45_000,
  })

  const openAIMessages = toOpenAIMessages(messages, systemPrompt)

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
    completion = await run({ type: 'json_object' })
  }

  const choice = completion?.choices?.[0]
  const text = choice?.message?.content || ''

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

    assertRateLimit(uid)

    const apiKey = process.env.CHAT_BUILDER_OPENROUTER_API_KEY
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

    const modelName = DEFAULT_MODEL
    const systemPrompt = buildSystemPrompt({ locale, preferredMethod })
    const latestUserText =
      [...messages].reverse().find((message) => message.role === 'user')
        ?.text || ''

    try {
      const generateResult = await callOpenRouterChatCompletion({
        apiKey,
        modelName,
        systemPrompt,
        messages,
        stagePrefix: 'generate',
      })

      let parsed
      try {
        parsed = JSON.parse(generateResult.text)
      } catch (parseErr) {
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
      })

      const usage = mergeUsage([
        generateResult.usage,
        ...(finalized.usageParts || []),
      ])

      return {
        draft: finalized.draft,
        model: modelName,
        usage,
      }
    } catch (err) {
      if (err instanceof functions.https.HttpsError) {
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
