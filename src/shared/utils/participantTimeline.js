// Groups one participant's log events into study steps for the Logs timeline.
// Pure and metadata-only: it reads event types, controlled references and
// counts, never answers.

const toMillis = (value) => {
  if (value?.toMillis) return value.toMillis()
  if (value instanceof Date) return value.getTime()
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

const TASK_EVENTS = new Set([
  'TASK_STARTED',
  'TASK_ATTEMPT_FINISHED',
  'MEDIA_RECORDING_OUTCOME',
])
const STAGES = ['preTest', 'postTest']

const taskIndexOf = (ref) => {
  const match = /^task:(0|[1-9]\d*)/.exec(ref || '')
  return match ? Number(match[1]) : null
}
const heuristicIndexOf = (ref) => {
  const match = /^heuristic:(\d+)/.exec(ref || '')
  return match ? Number(match[1]) : null
}
const stageOf = (ref) => STAGES.find((stage) => ref?.startsWith(`${stage}:`))

export const stepKeyFor = (event) => {
  const details = event?.details || {}
  switch (event?.eventType) {
    case 'STUDY_VIEW_OPENED':
      return 'session'
    case 'CONSENT_ACCEPTED':
      return 'consent'
    case 'STUDY_SUBMITTED':
      return 'submitted'
    case 'QUESTION_RESPONSE_UPDATED': {
      const heuristic = heuristicIndexOf(details.questionRef)
      return heuristic === null ? 'other' : `heuristic:${heuristic}`
    }
    case 'STRUCTURED_RESPONSE_ACTIVITY': {
      if (STAGES.includes(details.scopeRef)) return details.scopeRef
      const task = taskIndexOf(details.scopeRef)
      return task === null ? 'other' : `task:${task}`
    }
    case 'ANSWER_EDITED': {
      const stage = stageOf(details.fieldRef)
      if (stage) return stage
      const task = taskIndexOf(details.fieldRef)
      if (task !== null) return `task:${task}`
      const heuristic = heuristicIndexOf(details.fieldRef)
      return heuristic === null ? 'other' : `heuristic:${heuristic}`
    }
    default: {
      if (!TASK_EVENTS.has(event?.eventType)) return 'other'
      const task = taskIndexOf(details.taskRef)
      return task === null ? 'other' : `task:${task}`
    }
  }
}

const STEP_ORDER = {
  session: 0,
  consent: 1,
  preTest: 2,
  task: 3,
  heuristic: 3,
  postTest: 4,
  submitted: 5,
  other: 6,
}
const kindOf = (key) => key.split(':')[0]
const orderOf = (key) => {
  const [kind, index] = key.split(':')
  return STEP_ORDER[kind] + (index === undefined ? 0 : Number(index) / 1000)
}

const questionsTouched = (events, stage) => {
  const questions = new Set()
  for (const event of events) {
    const details = event.details || {}
    const field = new RegExp(`^${stage}:(\\d+):`).exec(details.fieldRef || '')
    if (field) questions.add(Number(field[1]))
    for (const item of details.items || []) {
      const selected = new RegExp(`^${stage}:question:(\\d+)$`).exec(
        item?.itemRef || '',
      )
      if (selected) questions.add(Number(selected[1]))
    }
  }
  return questions.size
}

const heuristicQuestions = (events) =>
  new Set(
    events.flatMap((event) => {
      const ref = event.details?.questionRef || event.details?.fieldRef || ''
      const match = /^heuristic:\d+:question:(\d+)/.exec(ref)
      return match ? [Number(match[1])] : []
    }),
  ).size

const taskSummary = (events) => {
  const finished = events.filter(
    (event) => event.eventType === 'TASK_ATTEMPT_FINISHED',
  )
  const last = finished.at(-1)
  const recordings = {}
  for (const event of events) {
    if (event.eventType !== 'MEDIA_RECORDING_OUTCOME') continue
    recordings[event.details?.mediaType] = event.details?.outcome
  }
  const typed = events.find((event) => event.details?.taskType)
  return {
    started: events.some((event) => event.eventType === 'TASK_STARTED'),
    outcome: last?.details?.outcome || null,
    durationMs: Number.isFinite(last?.details?.taskDurationMs)
      ? last.details.taskDurationMs
      : null,
    taskType: typed?.details?.taskType || null,
    questionnaireUpdates: events
      .filter((event) => event.eventType === 'STRUCTURED_RESPONSE_ACTIVITY')
      .flatMap((event) => event.details?.items || [])
      .reduce((total, item) => total + (Number(item?.changes) || 0), 0),
    recordings,
  }
}

const statusOf = (kind, events, summary) => {
  const hasProblem = events.some((event) =>
    ['warning', 'error'].includes(event.level),
  )
  if (kind === 'task') {
    if (summary.outcome === 'not_completed') return 'problem'
    if (summary.outcome) return hasProblem ? 'problem' : 'done'
    return 'open'
  }
  return hasProblem ? 'problem' : 'done'
}

const summaryFor = (kind, events) => {
  if (kind === 'task') return taskSummary(events)
  if (kind === 'preTest' || kind === 'postTest')
    return { questions: questionsTouched(events, kind) }
  if (kind === 'heuristic') return { questions: heuristicQuestions(events) }
  if (kind === 'session') return { opens: events.length }
  return {}
}

export const buildParticipantTimeline = (events = []) => {
  const ordered = events
    .map((event) => ({ event, at: toMillis(event.occurredAt) }))
    .sort((left, right) => (left.at ?? 0) - (right.at ?? 0))
  const groups = new Map()
  for (const { event, at } of ordered) {
    const key = stepKeyFor(event)
    if (!groups.has(key)) groups.set(key, { key, events: [], times: [] })
    groups.get(key).events.push(event)
    if (at !== null) groups.get(key).times.push(at)
  }

  const steps = [...groups.values()]
    .sort((left, right) => orderOf(left.key) - orderOf(right.key))
    .map(({ key, events: stepEvents, times }) => {
      const kind = kindOf(key)
      const summary = summaryFor(kind, stepEvents)
      const [, index] = key.split(':')
      return {
        key,
        kind,
        index: index === undefined ? null : Number(index),
        events: stepEvents,
        startedAt: times.length ? Math.min(...times) : null,
        endedAt: times.length ? Math.max(...times) : null,
        summary,
        status: statusOf(kind, stepEvents, summary),
      }
    })

  const times = ordered.map(({ at }) => at).filter((at) => at !== null)
  const submitted = ordered.find(
    ({ event }) => event.eventType === 'STUDY_SUBMITTED',
  )
  return {
    participantLabel: events[0]?.participantLabel || null,
    submittedAt: submitted?.at ?? null,
    firstActivityAt: times.length ? Math.min(...times) : null,
    lastActivityAt: times.length ? Math.max(...times) : null,
    steps,
  }
}
