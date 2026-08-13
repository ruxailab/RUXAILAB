import { functions } from '../f.firebase.js'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

const fail = (code, message) => {
  throw new functions.https.HttpsError(code, message)
}

const openRouterHeaders = (apiKey) => ({
  authorization: `Bearer ${apiKey}`,
  'content-type': 'application/json',
  ...(process.env.SITE_URL ? { 'HTTP-Referer': process.env.SITE_URL } : {}),
  'X-OpenRouter-Title': 'RUXAILAB',
})

export const listAgentModels = functions.onCall({
  options: { timeoutSeconds: 30, memory: '256MiB' },
  handler: async (request) => {
    if (!request.auth) fail('unauthenticated', 'Debes iniciar sesión.')
    const apiKey =
      process.env.AGENTS_RESPONSE_OPENROUTER_API_KEY ||
      process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      fail(
        'failed-precondition',
        'AGENTS_RESPONSE_OPENROUTER_API_KEY no está configurada en Functions.',
      )
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: openRouterHeaders(apiKey),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) {
      fail(
        'unavailable',
        `No se pudo cargar el catálogo de OpenRouter (HTTP ${response.status}).`,
      )
    }

    const payload = await response.json()
    const models = (payload.data || [])
      .filter((model) => model?.id && model?.name)
      .map((model) => ({
        id: model.id,
        name: model.name,
        contextLength: model.context_length || null,
        promptPrice: model.pricing?.prompt || null,
        completionPrice: model.pricing?.completion || null,
        supportsStructuredOutput: (model.supported_parameters || []).some(
          (parameter) =>
            parameter === 'response_format' ||
            parameter === 'structured_outputs',
        ),
      }))
      .sort((left, right) => left.name.localeCompare(right.name))

    return { models }
  },
})
