import { HeuristicEvaluationRunner } from '@/ux/Heuristic/ai-agents/services/HeuristicEvaluationRunner'
import HeuristicAgent from '@/ux/Heuristic/ai-agents/models/HeuristicAgent'

const context = () => ({
  userId: 'owner',
  agent: new HeuristicAgent({
    id: 'agent',
    name: 'Reviewer',
    ownerId: 'owner',
  }),
  urls: ['https://example.com'],
  test: {
    id: 'study',
    answersDocId: 'study-answers',
    testStructure: [
      {
        id: 'h1',
        title: 'First',
        questions: [{ id: 'q1', title: 'Question one' }],
      },
      {
        id: 'h2',
        title: 'Second',
        questions: [{ id: 'q2', title: 'Question two' }],
      },
    ],
    testOptions: [{ text: 'Yes', value: 1 }],
  },
})
const setup = () => {
  const provider = {
    evaluate: jest.fn(async ({ questions }) =>
      questions.map((q) => ({ ...q, answer: 1, comment: 'Clear labels' })),
    ),
  }
  const saveAnswer = jest.fn().mockResolvedValue(undefined)
  const runner = new HeuristicEvaluationRunner({
    loadPage: jest.fn().mockResolvedValue({ root: { tag: 'html' } }),
    createProvider: () => provider,
    saveAnswer,
  })
  return { runner, provider, saveAnswer }
}

describe('background heuristic evaluation', () => {
  it('continues independently of views, retains results and snapshots the study destination', async () => {
    const { runner, provider, saveAnswer } = setup()
    let release
    provider.evaluate.mockImplementationOnce(
      ({ questions }) =>
        new Promise((resolve) => {
          release = () =>
            resolve(
              questions.map((q) => ({
                ...q,
                answer: 1,
                comment: 'Clear labels',
              })),
            )
        }),
    )
    const input = context()
    const execution = runner.start(input)
    const job = runner.getJob('owner', 'study')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(job.running).toBe(true)
    // Simulate leaving the route and the store loading a different study.
    input.test.id = 'other'
    input.test.answersDocId = 'other-answers'
    expect(runner.getJob('owner', 'other').running).toBe(false)
    release()
    await execution
    const restored = runner.getJob('owner', 'study')
    expect(restored).toBe(job)
    expect(restored.running).toBe(false)
    expect(restored.results).toHaveLength(1)
    expect(
      restored.progress[input.urls[0]].heuristics.map((h) => h.status),
    ).toEqual(['completed', 'completed'])
    expect(
      restored.progress[input.urls[0]].heuristics[0].answer
        .heuristicQuestions[0].heuristicComment,
    ).toBe('Clear labels')
    expect(saveAnswer).toHaveBeenCalledTimes(3)
    expect(
      saveAnswer.mock.calls.every((call) => call[1] === 'study-answers'),
    ).toBe(true)
    expect(saveAnswer.mock.calls[0][0].submitted).toBe(false)
    expect(saveAnswer.mock.calls[2][0].submitted).toBe(true)
  })

  it('retains pause controls across visits and prevents duplicate runs', async () => {
    const { runner, provider } = setup()
    const input = context()
    const execution = runner.start(input)
    const job = runner.getJob('owner', 'study')
    runner.toggle(job, input.urls[0], 1)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
    await runner.start(input)
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
    runner.toggle(runner.getJob('owner', 'study'), input.urls[0], 1)
    await execution
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    expect(job.outcome).toEqual({ saved: 1, failed: 0 })
  })

  it('shares the request limit across studies and releases slots after errors', async () => {
    const { runner } = setup()
    const releases = []
    let active = 0
    let peak = 0
    const provider = {
      evaluate: jest.fn(
        () =>
          new Promise((resolve, reject) => {
            active += 1
            peak = Math.max(peak, active)
            releases.push((fail = false) => {
              active -= 1
              if (fail) reject(new Error('Unavailable'))
              else resolve([])
            })
          }),
      ),
    }
    const pending = Array.from({ length: 5 }, () =>
      runner.request(provider, {}),
    )
    const settled = Promise.allSettled(pending)
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    releases[0](true)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(3)
    releases[1]()
    releases[2]()
    await new Promise((resolve) => setTimeout(resolve, 0))
    releases[3]()
    releases[4]()
    const results = await settled
    expect(peak).toBe(2)
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(4)
    expect(runner.activeRequests).toBe(0)
  })

  it('does not start a queued batch after its heuristic is paused', async () => {
    const { runner } = setup()
    const releases = []
    const provider = {
      evaluate: jest.fn(
        () => new Promise((resolve) => releases.push(() => resolve([]))),
      ),
    }
    const first = runner.request(provider, {})
    const second = runner.request(provider, {})
    const item = { paused: false, status: 'pending' }
    const queued = runner.request(provider, {}, item)
    item.paused = true
    releases[0]()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    expect(item.status).toBe('paused')
    item.paused = false
    item.resume()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(3)
    expect(item.status).toBe('running')
    releases[1]()
    releases[2]()
    await Promise.all([first, second, queued])
  })

  it('pauses globally across views while allowing active requests to finish', async () => {
    const { runner, provider } = setup()
    let finish
    provider.evaluate.mockImplementationOnce(
      ({ questions }) =>
        new Promise((resolve) => {
          finish = () => resolve(questions.map((q) => ({ ...q, answer: 1 })))
        }),
    )
    const input = context()
    const execution = runner.start(input)
    const job = runner.getJob('owner', 'study')
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.toggleAll(job)
    finish()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
    expect(job.progress[input.urls[0]].heuristics[0].answer).toBeTruthy()
    expect(runner.getJob('owner', 'study').paused).toBe(true)
    runner.toggleAll(job)
    await execution
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    expect(job.paused).toBe(false)
  })

  it('holds queued requests during global pause without blocking other studies', async () => {
    const { runner } = setup()
    const releases = []
    const provider = {
      evaluate: jest.fn(() => new Promise((resolve) => releases.push(resolve))),
    }
    const first = runner.request(provider, {})
    const second = runner.request(provider, {})
    const job = runner.getJob('owner', 'study')
    job.running = true
    const queued = runner.request(provider, {}, undefined, job)
    runner.toggleAll(job)
    releases[0]([])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    const other = runner.request(provider, {})
    expect(provider.evaluate).toHaveBeenCalledTimes(3)
    releases[1]([])
    releases[2]([])
    runner.toggleAll(job)
    await new Promise((resolve) => setTimeout(resolve, 0))
    releases[3]([])
    await Promise.all([first, second, queued, other])
    expect(runner.activeRequests).toBe(0)
  })

  it('retains valid answers from an incomplete batch', async () => {
    const { runner, provider } = setup()
    const input = context()
    input.test.testStructure = [
      { id: 'h1', questions: [{ id: 'q1' }, { id: 'q2' }] },
    ]
    provider.evaluate.mockResolvedValueOnce([
      { heuristicId: 'h1', questionId: 'q1', answer: 1 },
    ])
    const execution = runner.start(input)
    const job = runner.getJob('owner', 'study')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(
      job.progress[input.urls[0]].heuristics[0].questionErrors[0],
    ).toBeUndefined()
    expect(
      job.progress[input.urls[0]].heuristics[0].questionErrors[1],
    ).toBeDefined()
    runner.retryQuestion(job, input.urls[0], 0, 1)
    await execution
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    expect(
      provider.evaluate.mock.calls[1][0].questions.map((q) => q.questionId),
    ).toEqual(['q2'])
    expect(
      job.results[0].heuristicQuestions[0].heuristicQuestions,
    ).toHaveLength(2)
  })

  it('retries a failed question without repeating completed heuristics', async () => {
    const { runner, provider, saveAnswer } = setup()
    provider.evaluate
      .mockImplementationOnce(async ({ questions }) =>
        questions.map((q) => ({ ...q, answer: 1 })),
      )
      .mockRejectedValueOnce(new Error('Provider unavailable'))
      .mockRejectedValueOnce(new Error('Still unavailable'))
    const execution = runner.start(context())
    const job = runner.getJob('owner', 'study')
    const url = 'https://example.com'
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(job.progress[url].heuristics[0].status).toBe('completed')
    expect(job.progress[url].heuristics[1].questionErrors[0].message).toBe(
      'Provider unavailable',
    )
    expect(saveAnswer).toHaveBeenCalledTimes(1)
    runner.retryQuestion(job, url, 1, 0)
    runner.retryQuestion(job, url, 1, 0)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(3)
    expect(job.progress[url].heuristics[1].questionErrors[0].message).toBe(
      'Still unavailable',
    )
    runner.retryQuestion(job, url, 1, 0)
    await execution
    expect(provider.evaluate).toHaveBeenCalledTimes(4)
    expect(
      provider.evaluate.mock.calls
        .slice(2)
        .every(
          ([c]) =>
            c.questions.length === 1 && c.questions[0].questionId === 'q2',
        ),
    ).toBe(true)
    expect(job.progress[url].heuristics[1].questionErrors).toEqual({})
    expect(job.outcome).toEqual({ saved: 1, failed: 0 })
    expect(saveAnswer).toHaveBeenLastCalledWith(
      expect.objectContaining({ submitted: true }),
      'study-answers',
    )
  })
})
