import OpenAI from 'openai'
import { admin, functions } from '../core/firebase/f.firebase.js'

const error = (code, message) => new functions.https.HttpsError(code, message)
const MAX_REQUESTS_PER_MINUTE = 5
const RATE_WINDOW_MS = 60_000
const rateLimitBuckets = new Map()

function assertRateLimit(uid) {
  const now = Date.now()
  const recent = (rateLimitBuckets.get(uid) ?? []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  )
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    throw error('resource-exhausted', 'Please wait before generating another synthesis')
  }
  recent.push(now)
  rateLimitBuckets.set(uid, recent)
}

function isFacilitator({ study, uid, isSuperAdmin }) {
  return (
    isSuperAdmin ||
    study?.testAdmin?.userDocId === uid ||
    study?.studyRoleMap?.[uid] === 0
  )
}

function analysisContext({ study, session }) {
  const guide = new Map(
    (Array.isArray(study?.discussionGuide) ? study.discussionGuide : []).map(
      (topic) => [topic.id, topic.title || topic.name || topic.id],
    ),
  )
  return Object.entries(session?.analysis?.perTopic ?? {})
    .slice(0, 20)
    .map(([topicId, analysis]) => {
      const keywords = (analysis?.keywords ?? [])
        .filter((keyword) => typeof keyword === 'string')
        .slice(0, 8)
        .join(', ')
      const summary = String(analysis?.summary ?? '').slice(0, 800)
      const consensus = Number.isFinite(analysis?.consensus?.score)
        ? Number(analysis.consensus.score).toFixed(2)
        : 'not enough participant responses to calculate'
      return `Topic: ${String(guide.get(topicId) ?? topicId).slice(0, 160)}\nKeywords: ${keywords}\nSummary: ${summary}\nParticipant wording similarity (not agreement): ${consensus}`
    })
    .join('\n\n')
}

export const synthesizeFocusGroupAnalysis = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, answersDocId, sessionId } = request?.data ?? {}
    if (!studyId || !answersDocId || !sessionId) {
      throw error('invalid-argument', 'studyId, answersDocId, and sessionId are required')
    }

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])
    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    const isSuperAdmin = userSnap.exists && userSnap.data()?.accessLevel === 0
    if (!isFacilitator({ study, uid, isSuperAdmin })) {
      throw error('permission-denied', 'Only the facilitator can generate a synthesis')
    }
    if (study.answersDocId !== answersDocId) {
      throw error('permission-denied', 'The answer document does not belong to this study')
    }

    const answerSnap = await db.collection('answers').doc(answersDocId).get()
    if (!answerSnap.exists) throw error('not-found', 'Answer document not found')
    const session = answerSnap.data()?.sessions?.[sessionId]
    if (!session) throw error('not-found', 'Session not found')
    const context = analysisContext({ study, session })
    if (!context) throw error('failed-precondition', 'Run the session analysis first')

    const apiKey = process.env.CHAT_BUILDER_OPENROUTER_API_KEY
    const baseURL = process.env.CHAT_BUILDER_OPENROUTER_BASE_URL
    const model =
      process.env.FOCUS_GROUP_ANALYSIS_OPENROUTER_MODEL ||
      process.env.CHAT_BUILDER_OPENROUTER_STUDY_MODEL
    if (!apiKey || !baseURL || !model) {
      throw error('failed-precondition', 'The server-side OpenRouter model is not configured')
    }

    assertRateLimit(uid)
    const client = new OpenAI({ apiKey, baseURL })
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              'You help a UX researcher synthesize focus-group findings. Use only the supplied summaries, keywords, and participant wording-similarity scores. Similarity is not agreement: do not infer consensus or disagreement from that score alone. Do not invent participant quotes, demographics, or causes. Give a concise evidence-grounded synthesis with key themes, notable differences explicitly present in the summaries, and limitations. Clearly label inferences.',
          },
          { role: 'user', content: context.slice(0, 12_000) },
        ],
      })
      const text = completion.choices?.[0]?.message?.content?.trim()
      if (!text) throw new Error('The model returned an empty synthesis')
      return { text: text.slice(0, 6000), model }
    } catch (err) {
      console.error('Focus Group synthesis request failed', err?.status, err?.message)
      throw error('internal', 'Could not generate the focus-group synthesis')
    }
  },
})
