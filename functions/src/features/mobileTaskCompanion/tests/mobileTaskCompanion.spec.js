import { FirestoreAnswerRepository } from '../../../shared/repositories/FirestoreAnswerRepository.js'
import { FirestoreStudyRepository } from '../../../shared/repositories/FirestoreStudyRepository.js'
import {
  COMPANION_STATUS,
  MobileTaskCompanion,
  PARTICIPATION_MODE,
} from '../models/MobileTaskCompanion.js'
import { FirestoreMobileTaskCompanionRepository } from '../repositories/FirestoreMobileTaskCompanionRepository.js'
import { FirestoreMobileTaskViewRepository } from '../repositories/FirestoreMobileTaskViewRepository.js'
import { MobileTaskCompanionService } from '../service/MobileTaskCompanionService.js'

const STUDY_ID = 'study-1'
const ANSWER_ID = 'answers-1'
const UID = 'participant1'

function createFakeFirestore() {
  const docs = new Map()
  const answerUpdates = []

  const setPath = (target, path, value) => {
    const parts = path.split('.')
    let cursor = target
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index]
      if (cursor[key] == null || typeof cursor[key] !== 'object') {
        cursor[key] = {}
      }
      cursor = cursor[key]
    }
    cursor[parts[parts.length - 1]] = value
  }

  const unsetPath = (target, path) => {
    const parts = path.split('.')
    let cursor = target
    for (let index = 0; index < parts.length - 1; index += 1) {
      cursor = cursor?.[parts[index]]
      if (!cursor || typeof cursor !== 'object') return
    }
    delete cursor[parts[parts.length - 1]]
  }

  const applyUpdate = (path, data) => {
    if (!docs.has(path)) {
      const error = new Error(`No document to update: ${path}`)
      error.code = 'not-found'
      throw error
    }
    const current = structuredClone(docs.get(path))
    for (const [key, value] of Object.entries(data)) {
      if (value && value.__op === 'delete') {
        unsetPath(current, key)
        continue
      }
      setPath(current, key, structuredClone(value))
    }
    docs.set(path, current)
    if (path.startsWith('answers/')) answerUpdates.push(structuredClone(data))
  }

  const makeRef = (path) => {
    const ref = {
      path,
      id: path.split('/').pop(),
      get parent() {
        const parts = path.split('/')
        if (parts.length < 2) return null
        return makeRef(parts.slice(0, -1).join('/'))
      },
      get: async () => {
        const data = docs.get(path)
        return {
          exists: data != null,
          id: path.split('/').pop(),
          data: () => (data == null ? undefined : structuredClone(data)),
        }
      },
      set: (data) => {
        docs.set(path, structuredClone(data))
      },
      update: (data) => {
        applyUpdate(path, data)
      },
      delete: () => {
        docs.delete(path)
      },
      collection: (name) => collectionApi(`${path}/${name}`),
    }
    return ref
  }

  const collectionApi = (prefix) => ({
    doc: (id) => makeRef(`${prefix}/${id}`),
  })

  return {
    docs,
    answerUpdates,
    collection: (name) => collectionApi(name),
    runTransaction: async (fn) =>
      fn({
        get: (ref) => ref.get(),
        set: (ref, data) => ref.set(data),
        update: (ref, data) => ref.update(data),
        delete: (ref) => ref.delete(),
      }),
  }
}

function seed(db, studyOverrides = {}) {
  db.collection('tests').doc(STUDY_ID).set({
    testType: 'USER',
    subType: null,
    isPublic: false,
    answersDocId: ANSWER_ID,
    testAdmin: { userDocId: 'owner' },
    studyRoleMap: { [UID]: 5 },
    testStructure: {
      userTasks: [
        {
          id: 'task-a',
          taskName: 'Find the price',
          taskDescription: '<p>Look at the header</p>',
          taskLink: 'https://secret.example/task',
        },
        {
          id: 'task-b',
          taskName: 'Checkout',
          taskDescription: 'Pay',
          taskLink: 'https://secret.example/pay',
        },
      ],
    },
    ...studyOverrides,
  })
  db.collection('answers').doc(ANSWER_ID).set({
    studyId: STUDY_ID,
    taskAnswers: {
      [UID]: {
        submitted: false,
        tasks: {
          0: {
            taskId: 'task-a',
            audioRecordURL: 'https://cdn/a.webm',
            susAnswers: [{ score: 1 }],
          },
          1: {
            taskId: 'task-b',
            webcamRecordURL: 'https://cdn/w.webm',
          },
        },
      },
    },
  })
}

function harness(studyOverrides = {}) {
  const db = createFakeFirestore()
  seed(db, studyOverrides)
  let clock = 1000
  let tokenCount = 0
  let attemptCount = 0
  const presenceRemoved = []
  const viewRepository = new FirestoreMobileTaskViewRepository(db)
  const service = new MobileTaskCompanionService({
    companionRepository: new FirestoreMobileTaskCompanionRepository(
      db,
      { delete: () => ({ __op: 'delete' }) },
      viewRepository,
    ),
    studyRepository: new FirestoreStudyRepository(db),
    answerRepository: new FirestoreAnswerRepository(db),
    presenceRepository: {
      remove: async (token) => {
        if (token) presenceRemoved.push(token)
      },
    },
    now: () => clock,
    createToken: () => {
      tokenCount += 1
      return tokenCount.toString(16).padStart(64, '0')
    },
    createAttemptId: () => {
      attemptCount += 1
      return `attempt-${attemptCount}`
    },
  })

  const caller = {
    uid: UID,
    signInProvider: 'anonymous',
    input: { studyId: STUDY_ID, answerId: ANSWER_ID },
  }

  return {
    db,
    service,
    caller,
    presenceRemoved,
    setClock: (value) => {
      clock = value
    },
    readAnswer: async () =>
      structuredClone(db.docs.get(`answers/${ANSWER_ID}`)),
    readCompanion: () =>
      db.docs.get(`tests/${STUDY_ID}/mobileTaskCompanions/${UID}`),
    readView: (token) =>
      db.docs.get(`tests/${STUDY_ID}/mobileTaskViews/${token}`),
  }
}

function phoneLocator(token, extra = {}) {
  return {
    studyId: STUDY_ID,
    participantUid: UID,
    token,
    ...extra,
  }
}

const taskInput = (index, id) => ({
  studyId: STUDY_ID,
  answerId: ANSWER_ID,
  taskIndex: index,
  taskId: id,
})

describe('MobileTaskCompanion', () => {
  it('round-trips the document without persisting path fields', () => {
    const companion = MobileTaskCompanion.create({
      id: UID,
      studyId: STUDY_ID,
      token: 'ab'.repeat(32),
      participantUid: UID,
      answerId: ANSWER_ID,
      status: COMPANION_STATUS.PAIRED,
      createdAt: 1000,
    })
    const stored = companion.toFirestore()

    expect(stored.id).toBeUndefined()
    expect(stored.studyId).toBeUndefined()
    expect(stored.token).toBe(companion.token)
    expect(stored.participantUid).toBe(UID)
    expect(stored.activeTask).toBeNull()
    expect(stored.taskPhaseCompleted).toBe(false)

    const loaded = MobileTaskCompanion.fromFirestore(stored, UID, STUDY_ID)
    expect(loaded).toMatchObject({
      id: UID,
      studyId: STUDY_ID,
      token: companion.token,
      participantUid: UID,
      answerId: ANSWER_ID,
      status: COMPANION_STATUS.PAIRED,
      createdAt: 1000,
      endedAt: null,
    })
  })
})

describe('MobileTaskCompanionService', () => {
  it('keeps the token when the desktop reloads', async () => {
    const { service, caller, readCompanion, readView, setClock } = harness()
    const created = await service.create(caller)
    const token = created.companion.token

    setClock(2500)
    await service.get(caller)
    const restored = await service.get(caller)

    expect(readView(token)).toEqual({ state: 'waiting' })
    expect(restored.companion.token).toBe(token)
    expect(restored.companion.status).toBe('paired')
    expect(restored.companion.activeTask).toBeNull()
    expect(readCompanion().token).toBe(token)
    expect(readCompanion().status).toBe('paired')
    expect(readCompanion().companionLastSeenAt).toBeNull()
  })

  it('returns only the public task fields while a task is active', async () => {
    const { service, caller, readCompanion, readView } = harness()
    const created = await service.create(caller)
    const started = await service.activate({
      ...caller,
      input: taskInput(0, 'task-a'),
    })

    const view = readView(created.companion.token)

    expect(started).toEqual({
      attemptId: 'attempt-1',
      startedAt: 1000,
      taskIndex: 0,
      taskId: 'task-a',
      taskNumber: 1,
    })
    expect(view).toEqual({
      state: 'active',
      taskNumber: 1,
      title: 'Find the price',
      description: '<p>Look at the header</p>',
      taskIndex: 0,
      taskId: 'task-a',
      attemptId: 'attempt-1',
    })
    expect(JSON.stringify(view)).not.toContain('secret.example')
    expect(JSON.stringify(view)).not.toContain(UID)
    expect(JSON.stringify(view)).not.toContain(ANSWER_ID)
    expect(readCompanion().activeTask.taskLink).toBeUndefined()
    expect(readCompanion().companionLastSeenAt).toBeNull()
  })

  it('does not change the answer when the locator does not match', async () => {
    const { service, caller, db, readAnswer, readCompanion, setClock } =
      harness()
    await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    const before = await readAnswer()
    const unknownToken = 'ab'.repeat(32)

    await expect(
      service.submitOutcome({
        uid: null,
        input: {
          ...phoneLocator(unknownToken),
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: 'attempt-1',
          outcome: 'completed',
        },
      }),
    ).rejects.toMatchObject({
      code: 'not-found',
      message: 'Mobile task session is not available',
    })

    setClock(4000)
    expect(readCompanion().companionLastSeenAt).toBeNull()
    expect(await readAnswer()).toEqual(before)
    expect(db.answerUpdates).toEqual([])
  })

  it('does not write the answer again when the same attemptId is retried', async () => {
    const { service, caller, db, readAnswer, readCompanion, readView, setClock } =
      harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    setClock(5000)

    const submit = () =>
      service.submitOutcome({
        uid: null,
        input: {
          ...phoneLocator(created.companion.token),
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: 'attempt-1',
          outcome: 'completed',
        },
      })

    const first = await submit()
    const second = await submit()
    const task = (await readAnswer()).taskAnswers[UID].tasks[0]

    expect(first).toEqual({
      accepted: true,
      duplicate: false,
      taskIndex: 0,
      taskId: 'task-a',
      attemptId: 'attempt-1',
      outcome: 'completed',
      completed: true,
      startedAt: 1000,
      endedAt: 5000,
      taskTime: 4000,
      participationMode: PARTICIPATION_MODE,
    })
    expect(second).toEqual({ ...first, duplicate: true })
    expect(db.answerUpdates).toHaveLength(1)
    expect(Object.keys(db.answerUpdates[0]).sort()).toEqual([
      'taskAnswers.participant1.tasks.0.attempted',
      'taskAnswers.participant1.tasks.0.completed',
      'taskAnswers.participant1.tasks.0.endedAt',
      'taskAnswers.participant1.tasks.0.participationMode',
      'taskAnswers.participant1.tasks.0.startedAt',
      'taskAnswers.participant1.tasks.0.taskTime',
    ])
    expect(task.audioRecordURL).toBe('https://cdn/a.webm')
    expect(task.susAnswers).toEqual([{ score: 1 }])
    expect(task.completed).toBe(true)
    expect(task.attempted).toBe(true)
    expect(task.taskTime).toBe(4000)

    setClock(8000)
    expect(readCompanion().activeTask).toBeNull()
    expect(readCompanion().lastOutcome.attemptId).toBe('attempt-1')
    expect(readView(created.companion.token)).toEqual({
      state: 'waiting',
    })
  })

  it('does not let a stale attemptId finish the newer task', async () => {
    const { service, caller, db, readAnswer } = harness()
    const created = await service.create(caller)
    const firstAttempt = await service.activate({
      ...caller,
      input: taskInput(0, 'task-a'),
    })
    await service.activate({ ...caller, input: taskInput(1, 'task-b') })

    await expect(
      service.submitOutcome({
        uid: null,
        input: {
          ...phoneLocator(created.companion.token),
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: firstAttempt.attemptId,
          outcome: 'completed',
        },
      }),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Task attempt is no longer active',
    })

    const tasks = (await readAnswer()).taskAnswers[UID].tasks
    expect(tasks[0].attempted).toBeUndefined()
    expect(tasks[1].attempted).toBeUndefined()
    expect(tasks[1].completed).toBeUndefined()
    expect(tasks[1].webcamRecordURL).toBe('https://cdn/w.webm')
    expect(db.answerUpdates).toEqual([])
  })

  it('keeps the first outcome when a second opposite outcome arrives', async () => {
    const { service, caller, db, readAnswer, setClock } = harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    setClock(5000)

    const stored = await service.submitOutcome({
      ...caller,
      input: {
        ...taskInput(0, 'task-a'),
        attemptId: 'attempt-1',
        outcome: 'completed',
      },
    })
    const opposite = await service.submitOutcome({
      uid: null,
      input: {
        ...phoneLocator(created.companion.token),
        taskIndex: 0,
        taskId: 'task-a',
        attemptId: 'attempt-1',
        outcome: 'not_completed',
      },
    })

    expect(stored.outcome).toBe('completed')
    expect(stored.duplicate).toBe(false)
    expect(opposite).toEqual({ ...stored, duplicate: true })
    expect((await readAnswer()).taskAnswers[UID].tasks[0].completed).toBe(true)
    expect(db.answerUpdates).toHaveLength(1)
  })

  it('rejects an outcome when the companion has ended', async () => {
    const { service, caller, db, readAnswer, readCompanion, readView } =
      harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    const before = await readAnswer()
    expect(readCompanion().token).toBe(created.companion.token)

    await expect(service.end(caller)).resolves.toEqual({ status: 'ended' })
    expect(readCompanion().token).toBeUndefined()

    await expect(
      service.submitOutcome({
        uid: null,
        input: {
          ...phoneLocator(created.companion.token),
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: 'attempt-1',
          outcome: 'completed',
        },
      }),
    ).rejects.toMatchObject({ code: 'not-found' })

    expect(await readAnswer()).toEqual(before)
    expect(db.answerUpdates).toEqual([])
    expect(readCompanion().status).toBe('ended')
    expect(readView(created.companion.token)).toBeUndefined()
  })

  it('rejects an outcome and end when the answer is already submitted', async () => {
    const { service, caller, db, readAnswer, readCompanion } = harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    db.docs.get(`answers/${ANSWER_ID}`).taskAnswers[UID].submitted = true
    const before = await readAnswer()

    await expect(
      service.submitOutcome({
        uid: null,
        input: {
          ...phoneLocator(created.companion.token),
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: 'attempt-1',
          outcome: 'not_completed',
        },
      }),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Answer is already submitted',
    })
    await expect(service.end(caller)).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Answer is already submitted',
    })

    expect(await readAnswer()).toEqual(before)
    expect(db.answerUpdates).toEqual([])
    expect(readCompanion().token).toBe(created.companion.token)
  })

  it('lets the study owner pair and still rejects a stranger or a moderated study', async () => {
    const adminHarness = harness()
    await expect(
      adminHarness.service.create({
        uid: 'owner',
        signInProvider: 'password',
        input: { studyId: STUDY_ID, answerId: ANSWER_ID },
      }),
    ).resolves.toMatchObject({
      companion: { companionId: 'owner', status: 'paired' },
    })

    await expect(
      adminHarness.service.create({
        uid: 'stranger',
        signInProvider: 'password',
        input: { studyId: STUDY_ID, answerId: ANSWER_ID },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })

    const moderated = harness({ subType: 'USER_MODERATED' })
    await expect(moderated.service.create(moderated.caller)).rejects.toMatchObject(
      { code: 'failed-precondition' },
    )
  })

  it('rejects create, get and activate when the study disables mobile task instructions', async () => {
    const { service, caller } = harness({
      allowMobileTaskInstructions: false,
    })

    await expect(service.create(caller)).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Mobile task instructions are disabled for this study',
    })
    await expect(service.get(caller)).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Mobile task instructions are disabled for this study',
    })
    await expect(
      service.activate({ ...caller, input: taskInput(0, 'task-a') }),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Mobile task instructions are disabled for this study',
    })
  })

  it('allows create when allowMobileTaskInstructions is true', async () => {
    const { service, caller } = harness({
      allowMobileTaskInstructions: true,
    })

    await expect(service.create(caller)).resolves.toMatchObject({
      companion: { status: 'paired' },
    })
  })

  it('publishes a public view for the phone and deletes it when the session ends', async () => {
    const { service, caller, readCompanion, readView, presenceRemoved } =
      harness()
    const created = await service.create(caller)
    const token = created.companion.token

    expect(readView(token)).toEqual({ state: 'waiting' })
    expect(JSON.stringify(readView(token))).not.toContain(UID)
    expect(JSON.stringify(readView(token))).not.toContain(ANSWER_ID)

    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    expect(readView(token)).toEqual({
      state: 'active',
      taskNumber: 1,
      title: 'Find the price',
      description: '<p>Look at the header</p>',
      taskIndex: 0,
      taskId: 'task-a',
      attemptId: 'attempt-1',
    })
    expect(JSON.stringify(readView(token))).not.toContain('secret.example')

    await service.submitOutcome({
      uid: null,
      input: {
        ...phoneLocator(token),
        taskIndex: 0,
        taskId: 'task-a',
        attemptId: 'attempt-1',
        outcome: 'completed',
      },
    })
    expect(readView(token)).toEqual({ state: 'waiting' })
    expect(readCompanion().activeTask).toBeNull()
    expect(readCompanion().lastOutcome.attemptId).toBe('attempt-1')

    await service.end(caller)
    expect(readView(token)).toBeUndefined()
    expect(presenceRemoved).toEqual([token])
  })

  it('returns waiting after an outcome so the phone is not stuck on saved', async () => {
    const { service, caller, readCompanion, readView } = harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })

    await service.submitOutcome({
      uid: null,
      input: {
        ...phoneLocator(created.companion.token),
        taskIndex: 0,
        taskId: 'task-a',
        attemptId: 'attempt-1',
        outcome: 'completed',
      },
    })

    expect(readCompanion().activeTask).toBeNull()
    expect(readCompanion().lastOutcome).toMatchObject({
      attemptId: 'attempt-1',
      outcome: 'completed',
    })
    expect(readView(created.companion.token)).toEqual({ state: 'waiting' })

    const next = await service.activate({
      ...caller,
      input: taskInput(1, 'task-b'),
    })
    expect(next.attemptId).toBe('attempt-2')
    expect(readView(created.companion.token)).toEqual({
      state: 'active',
      taskNumber: 2,
      title: 'Checkout',
      description: 'Pay',
      taskIndex: 1,
      taskId: 'task-b',
      attemptId: 'attempt-2',
    })
  })

  it('keeps the public view on thank-you when the desktop leaves the last task', async () => {
    const { service, caller, readCompanion, readView } = harness()
    const created = await service.create(caller)
    const token = created.companion.token
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })
    await service.submitOutcome({
      uid: null,
      input: {
        ...phoneLocator(token),
        taskIndex: 0,
        taskId: 'task-a',
        attemptId: 'attempt-1',
        outcome: 'completed',
      },
    })
    await service.activate({ ...caller, input: taskInput(1, 'task-b') })
    await service.submitOutcome({
      uid: null,
      input: {
        ...phoneLocator(token),
        taskIndex: 1,
        taskId: 'task-b',
        attemptId: 'attempt-2',
        outcome: 'not_completed',
      },
    })

    const first = await service.completeTaskPhase(caller)
    const again = await service.completeTaskPhase(caller)

    expect(first).toEqual({ status: 'completed' })
    expect(again).toEqual({ status: 'completed' })
    expect(readCompanion().token).toBe(token)
    expect(readCompanion().status).toBe('paired')
    expect(readCompanion().taskPhaseCompleted).toBe(true)
    expect(readCompanion().activeTask).toBeNull()
    expect(readView(token)).toEqual({ state: 'completed' })

    await service.end(caller)
    expect(readView(token)).toBeUndefined()
  })

  it('does not reset an active public view when create reuses the token', async () => {
    const { service, caller, readView } = harness()
    const created = await service.create(caller)
    await service.activate({ ...caller, input: taskInput(0, 'task-a') })

    const again = await service.create(caller)
    expect(again.companion.token).toBe(created.companion.token)
    expect(readView(created.companion.token).state).toBe('active')
  })
})
