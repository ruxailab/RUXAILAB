import { prepareAgentStudy } from '@/ux/Heuristic/utils/heuristicAgentStudyMode'
import { reactive } from 'vue'
import HeuristicAgentEvaluator from './HeuristicAgentEvaluator'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'

/** Owns evaluations independently of route components. */
export class HeuristicEvaluationRunner {
  constructor({
    loadPage,
    createProvider,
    saveAnswer,
    now = () => Date.now(),
  }) {
    this.loadPage = loadPage
    this.createProvider = createProvider
    this.saveAnswer = saveAnswer
    this.now = now
    this.jobs = new Map()
    this.activeRequests = 0
    this.requestQueue = []
  }

  getJob(userId, testId) {
    const key = JSON.stringify([userId, testId])
    if (!this.jobs.has(key)) {
      this.jobs.set(
        key,
        reactive({
          running: false,
          paused: false,
          agentId: null,
          urls: [],
          progress: {},
          results: [],
          outcome: null,
        }),
      )
    }
    return this.jobs.get(key)
  }

  toggleAll(job) {
    if (!job.running) return
    job.paused = !job.paused
    if (!job.paused) {
      const resume = job.resumeAll
      delete job.waitingAll
      delete job.resumeAll
      resume?.()
    }
  }

  async waitForJob(job) {
    while (job?.paused) {
      if (!job.waitingAll) {
        job.waitingAll = new Promise((resolve) => {
          job.resumeAll = resolve
        })
      }
      await job.waitingAll
    }
  }

  toggle(job, url, index) {
    const item = job.progress[url]?.heuristics[index]
    if (
      !job.running ||
      !item ||
      ['completed', 'error', 'blocked'].includes(item.status)
    )
      return
    item.paused = !item.paused
    if (item.status !== 'running')
      item.status = item.paused ? 'paused' : 'pending'
    if (!item.paused) item.resume?.()
  }

  retryQuestion(job, url, index, questionIndex) {
    const question =
      job.progress[url]?.heuristics[index]?.questionErrors?.[questionIndex]
    if (!job.running || !question?.retry || question.retrying) return
    question.retrying = true
    const retry = question.retry
    delete question.retry
    retry(() => {
      delete job.progress[url].heuristics[index].questionErrors[questionIndex]
    })
  }

  async wait(item) {
    if (!item.paused) return
    item.status = 'paused'
    if (!item.waiting) {
      item.waiting = new Promise((resolve) => {
        item.resume = resolve
      })
    }
    await item.waiting
    delete item.waiting
    delete item.resume
  }

  async request(provider, context, item, job) {
    if (job?.paused) await this.waitForJob(job)
    // A shared limit keeps multiple pages and studies from multiplying load.
    if (this.activeRequests >= 2) {
      await new Promise((resolve) => this.requestQueue.push(resolve))
    } else {
      this.activeRequests += 1
    }
    try {
      if (!item?.paused && !job?.paused) {
        if (item) item.status = 'running'
        return await provider.evaluate(context)
      }
    } finally {
      const next = this.requestQueue.shift()
      if (next) next()
      else this.activeRequests -= 1
    }
    await this.waitForJob(job)
    if (item) await this.wait(item)
    return this.request(provider, context, item, job)
  }

  async start({ userId, test, agent, urls }) {
    const job = this.getJob(userId, test.id)
    if (job.running) return job
    // Freeze inputs: navigating to another study must never redirect writes.
    const study = prepareAgentStudy(JSON.parse(JSON.stringify(test)))
    job.studyMode = study.studyMode
    job.paused = false
    job.running = true
    job.agentId = agent.id
    job.urls = [...urls]
    job.results = []
    job.outcome = null
    job.progress = Object.fromEntries(
      urls.map((url) => [
        url,
        {
          status: 'pending',
          current: 0,
          total: study.testStructure.length,
          heuristics: study.testStructure.map((heuristic) => ({
            title: heuristic.title || heuristic.name || '',
            status: 'pending',
            paused: false,
            answer: null,
            completedAt: null,
            completedQuestions: 0,
            totalQuestions: (heuristic.questions || []).length,
            questionErrors: {},
            questionTitles: (heuristic.questions || []).map(
              (question, index) =>
                question.title || question.text || `${index + 1}`,
            ),
          })),
        },
      ]),
    )
    let next = 0
    const worker = async () => {
      while (next < job.urls.length) {
        await this.waitForJob(job)
        if (next >= job.urls.length) break
        const url = job.urls[next++]
        const page = job.progress[url]
        const startedAt = this.now()
        const answerId = `ai-agent:${encodeURIComponent(agent.id)}:${encodeURIComponent(url).replaceAll('.', '%2E')}`
        const completed = new Map()
        try {
          page.status = 'running'
          const tree = await this.loadPage(url, study.id)
          const provider = this.createProvider(study.id, agent.id)
          const evaluator = new HeuristicAgentEvaluator({
            provider: {
              evaluate: (context) =>
                this.request(
                  provider,
                  context,
                  page.heuristics[context.questions[0].heuristicIndex],
                  job,
                ),
            },
            saveAnswer: (answer) => this.saveAnswer(answer, study.answersDocId),
          })
          const result = await evaluator.evaluateAndSave({
            agent,
            userId,
            test: study,
            webTree: tree,
            answerId,
            beforeHeuristic: async (index) => {
              await this.waitForJob(job)
              await this.wait(page.heuristics[index])
              await this.waitForJob(job)
            },
            onQuestionError: ({ index, questionIndex, error }) =>
              new Promise((resolve) => {
                page.heuristics[index].questionErrors[questionIndex] = {
                  message: error.message,
                  retrying: false,
                  retry: resolve,
                }
              }),
            onQuestionProgress: ({ index, completed }) => {
              page.heuristics[index].completedQuestions = completed
            },
            onHeuristicCompleted: async (index, answer) => {
              completed.set(index, answer)
              const total = study.testStructure.reduce(
                (sum, h) => sum + (h.questions || []).length,
                0,
              )
              const answered = [...completed.values()].reduce(
                (sum, h) => sum + h.heuristicQuestions.length,
                0,
              )
              await this.saveAnswer(
                new HeuristicAnswer({
                  heuristicQuestions: [...completed.entries()]
                    .sort(([a], [b]) => a - b)
                    .map(([, answer]) => answer),
                  total,
                  progress: total ? Math.round((answered / total) * 100) : 100,
                  submitted: false,
                  userDocId: answerId,
                  lastUpdate: this.now(),
                  evaluationTimeMs: this.now() - startedAt,
                }),
                study.answersDocId,
              )
              page.heuristics[index].answer = answer
              page.heuristics[index].completedAt = this.now()
            },
            onProgress: ({ index, status }) => {
              page.heuristics[index - 1].status = status
              page.current = page.heuristics.filter(
                (item) => item.answer,
              ).length
            },
          })
          page.status = 'completed'
          job.results.push(result)
        } catch (error) {
          page.status = 'error'
          page.error = error.message
          const active = page.heuristics.find(
            (item) => item.status === 'running',
          )
          if (active) {
            active.status = 'error'
            active.error = error.message
          }
          page.heuristics.forEach((item) => {
            if (['pending', 'paused'].includes(item.status))
              item.status = 'blocked'
          })
        }
      }
    }
    try {
      await Promise.all(
        Array.from({ length: Math.min(2, job.urls.length) }, worker),
      )
      const failed = job.urls.filter(
        (url) => job.progress[url].status === 'error',
      ).length
      job.outcome = { saved: job.results.length, failed }
    } finally {
      job.running = false
      job.paused = false
    }
    return job
  }
}
