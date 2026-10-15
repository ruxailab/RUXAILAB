import HeuristicAgent, {
  AGENT_VISIBILITY,
} from '@/ux/Heuristic/ai-agents/models/HeuristicAgent'
import WebTreeBuilder from '@/ux/Heuristic/ai-agents/services/WebTreeBuilder'
import HeuristicAgentEvaluator from '@/ux/Heuristic/ai-agents/services/HeuristicAgentEvaluator'

describe('Heuristic AI agents', () => {
  it('applies private, shared and public access rules', () => {
    const privateAgent = new HeuristicAgent({
      name: 'Private',
      ownerId: 'owner',
    })
    expect(privateAgent.canBeUsedBy('owner')).toBe(true)
    expect(privateAgent.canBeUsedBy('other')).toBe(false)

    const sharedAgent = new HeuristicAgent({
      name: 'Shared',
      ownerId: 'owner',
      visibility: AGENT_VISIBILITY.SHARED,
      sharedWith: ['member', 'member'],
    })
    expect(sharedAgent.canBeUsedBy('member')).toBe(true)
    expect(sharedAgent.sharedWith).toEqual(['member'])

    const publicAgent = new HeuristicAgent({
      name: 'Public',
      ownerId: 'owner',
      visibility: AGENT_VISIBILITY.PUBLIC,
    })
    expect(publicAgent.canBeUsedBy('anyone')).toBe(true)
  })

  it('builds a DOM tree with direct-child and descendant counts', () => {
    const tree = new WebTreeBuilder().fromHtml(`
      <!doctype html><html lang="en"><head><title>Example</title></head>
      <body><main id="content"><h1>Hello</h1><section><button aria-label="Save">Save</button></section></main>
      <script>ignored()</script></body></html>
    `)

    expect(tree.title).toBe('Example')
    expect(tree.nodeCount).toBe(8)
    expect(tree.root.childCount).toBe(2)
    const main = tree.root.children[1].children[0]
    expect(main.tag).toBe('main')
    expect(main.childCount).toBe(2)
    expect(main.descendantCount).toBe(3)
    expect(main.children[1].children[0].attributes['aria-label']).toBe('Save')
  })

  it('limits large page trees', () => {
    const tree = new WebTreeBuilder({ maxNodes: 3 }).fromHtml(
      '<html><body><main><p>one</p><p>two</p></main></body></html>',
    )
    expect(tree.nodeCount).toBe(3)
    expect(tree.truncated).toBe(true)
  })

  it('creates an answer compatible with a human heuristic evaluator', async () => {
    const agent = new HeuristicAgent({
      id: 'agent-1',
      name: 'Accessibility reviewer',
      ownerId: 'owner',
    })
    const provider = {
      evaluate: jest.fn().mockResolvedValue([
        {
          heuristicId: 'h1',
          questionId: 'q1',
          answer: 2,
          comment: 'The label is unclear.',
          evidence: ['button[aria-label="Save"]'],
          screenshot: {
            url: 'https://example.com/evidence.png',
            selector: 'button[aria-label="Save"]',
            createdAt: 40,
          },
        },
      ]),
    }
    const evaluator = new HeuristicAgentEvaluator({ provider, now: () => 42 })
    const answer = await evaluator.evaluate({
      agent,
      userId: 'owner',
      test: {
        testStructure: [
          {
            id: 'h1',
            title: 'Clarity',
            questions: [{ id: 'q1', title: 'Clear labels?' }],
          },
        ],
        testOptions: [{ text: 'Problem', value: 2 }],
      },
      webTree: { root: { tag: 'html', children: [] }, nodeCount: 1 },
    })

    expect(answer.submitted).toBe(true)
    expect(answer.progress).toBe(100)
    expect(answer.userDocId).toBe('ai-agent:agent-1')
    expect(answer.evaluationTimeMs).toBe(0)
    expect(answer.toFirestore().evaluationTimeMs).toBe(0)
    expect(
      answer.heuristicQuestions[0].heuristicQuestions[0].heuristicAnswer,
    ).toEqual({
      mode: 'customOptions',
      custom: {
        text: 'Problem',
        value: 2,
        timestamp: undefined,
      },
      text: 'Problem',
      value: 2,
    })
    expect(
      answer.toFirestore().heuristicQuestions[0].heuristicQuestions[0]
        .comments[0].text,
    ).toBe('The label is unclear.')
    expect(
      answer.toFirestore().heuristicQuestions[0].heuristicQuestions[0].images,
    ).toEqual([
      {
        id: 'ai-screenshot-h1-q1',
        url: 'https://example.com/evidence.png',
        createdAt: 40,
      },
    ])
  })

  it.each([
    {
      name: 'frequency',
      settings: { useFrequency: true, useSeverity: false },
      decision: { frequency: 3 },
      expected: {
        mode: 'frequency',
        frequency: 3,
        text: 'Frequency: 3',
        value: 3,
      },
    },
    {
      name: 'severity',
      settings: { useFrequency: false, useSeverity: true },
      decision: { severity: 4 },
      expected: {
        mode: 'severity',
        severity: 4,
        text: 'Severity: 4',
        value: 4,
      },
    },
    {
      name: 'frequency and severity',
      settings: { useFrequency: true, useSeverity: true },
      decision: { frequency: 2, severity: 4 },
      expected: {
        mode: 'frequencySeverity',
        frequency: 2,
        severity: 4,
        text: 'Frequency: 2 | Severity: 4',
        value: { frequency: 2, severity: 4 },
      },
    },
  ])('uses $name when the test has no custom options', async (scenario) => {
    const provider = {
      evaluate: jest.fn().mockResolvedValue([
        {
          heuristicId: 'h1',
          questionId: 'h1',
          ...scenario.decision,
          comment: 'AI assessment',
          evidence: [],
        },
      ]),
    }
    const evaluator = new HeuristicAgentEvaluator({ provider })
    const answer = await evaluator.evaluate({
      agent: new HeuristicAgent({
        id: 'agent-1',
        name: 'Agent',
        ownerId: 'owner',
      }),
      userId: 'owner',
      test: {
        testStructure: [
          {
            id: 'h1',
            questions: [{ id: 'q1', title: 'Question' }],
          },
        ],
        testOptions: [],
        ...scenario.settings,
      },
      webTree: { root: { tag: 'html' } },
    })

    expect(provider.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        answerMode: scenario.expected.mode,
        options: [],
      }),
    )
    expect(
      answer.heuristicQuestions[0].heuristicQuestions[0].heuristicAnswer,
    ).toEqual(scenario.expected)
  })

  it('waits for a paused heuristic without repeating completed requests', async () => {
    let resume
    const paused = new Promise((resolve) => {
      resume = resolve
    })
    const provider = {
      evaluate: jest
        .fn()
        .mockImplementation(async ({ questions }) =>
          questions.map((question) => ({ ...question, answer: 1 })),
        ),
    }
    const onProgress = jest.fn()
    const beforeHeuristic = jest.fn((index) =>
      index === 1 ? paused : undefined,
    )
    const evaluation = new HeuristicAgentEvaluator({ provider }).evaluate({
      agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
      userId: 'owner',
      test: {
        testStructure: [
          { questions: [{ text: 'First question' }] },
          { questions: [{ text: 'Second question' }] },
        ],
        testOptions: [{ text: 'Yes', value: 1 }],
      },
      webTree: { root: { tag: 'html' } },
      beforeHeuristic,
      onProgress,
    })
    // Let the first request complete and the second reach its pause gate.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
    expect(beforeHeuristic).toHaveBeenCalledWith(1)
    expect(onProgress).toHaveBeenLastCalledWith({
      index: 1,
      total: 2,
      status: 'completed',
    })
    resume()
    const answer = await evaluation
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    expect(answer.heuristicQuestions).toHaveLength(2)
    expect(answer.submitted).toBe(true)
  })

  it('overlaps bounded batches and reports validated question progress in completion order', async () => {
    const requests = []
    let active = 0
    let peak = 0
    const provider = {
      evaluate: jest.fn(
        ({ questions }) =>
          new Promise((resolve) => {
            active += 1
            peak = Math.max(peak, active)
            requests.push(() => {
              active -= 1
              resolve(questions.map((question) => ({ ...question, answer: 1 })))
            })
          }),
      ),
    }
    const onQuestionProgress = jest.fn()
    const evaluation = new HeuristicAgentEvaluator({ provider }).evaluate({
      agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
      userId: 'owner',
      test: {
        testStructure: [
          {
            questions: Array.from({ length: 9 }, (_, id) => ({
              id,
              text: `Question ${id}`,
            })),
          },
        ],
        testOptions: [{ text: 'Yes', value: 1 }],
      },
      webTree: { root: { tag: 'html' } },
      onQuestionProgress,
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(provider.evaluate).toHaveBeenCalledTimes(2)
    requests[1]()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onQuestionProgress).toHaveBeenLastCalledWith({
      index: 0,
      completed: 4,
      total: 9,
    })
    expect(provider.evaluate).toHaveBeenCalledTimes(3)
    requests[2]()
    requests[0]()
    const answer = await evaluation
    expect(peak).toBe(2)
    expect(
      provider.evaluate.mock.calls.map(([call]) => call.questions.length),
    ).toEqual([4, 4, 1])
    expect(onQuestionProgress).toHaveBeenLastCalledWith({
      index: 0,
      completed: 9,
      total: 9,
    })
    expect(
      answer.heuristicQuestions[0].heuristicQuestions.map((q) => q.heuristicId),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it.each([
    {
      name: 'traditional with leftover options',
      settings: { useWeights: false, useFrequency: true, useSeverity: true },
      mode: 'frequencySeverity',
      decision: { frequency: 2, severity: 3 },
      value: { frequency: 2, severity: 3 },
    },
    {
      name: 'detailed',
      settings: { useWeights: false, useFrequency: false, useSeverity: false },
      mode: 'customOptions',
      decision: { answer: 1 },
      value: 1,
    },
    {
      name: 'weights',
      settings: {
        useWeights: true,
        useFrequency: false,
        useSeverity: false,
        testWeights: { 0: [4] },
      },
      mode: 'weight',
      decision: { weight: 5 },
      value: 5,
    },
  ])(
    'honors the configured $name study mode',
    async ({ settings, mode, decision, value }) => {
      const options = [{ text: 'Meets criterion', value: 1 }]
      const provider = {
        evaluate: jest.fn().mockResolvedValue([
          {
            heuristicId: 'h1',
            questionId: mode === 'customOptions' ? 'q1' : 'h1',
            ...decision,
          },
        ]),
      }
      const answer = await new HeuristicAgentEvaluator({ provider }).evaluate({
        agent: new HeuristicAgent({
          id: 'a1',
          name: 'Agent',
          ownerId: 'owner',
        }),
        userId: 'owner',
        test: {
          ...settings,
          testOptions: options,
          testStructure: [{ id: 'h1', questions: [{ id: 'q1' }] }],
        },
        webTree: { root: { tag: 'html' } },
      })
      expect(provider.evaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          answerMode: mode,
          options: mode === 'customOptions' ? options : [],
        }),
      )
      expect(
        answer.heuristicQuestions[0].heuristicQuestions[0].heuristicAnswer,
      ).toEqual(expect.objectContaining({ mode, value }))
    },
  )

  it('assigns heuristic weights without requiring detailed answer options', async () => {
    const provider = {
      evaluate: jest.fn(async ({ questions }) =>
        questions.map((q) => ({ ...q, weight: 6 })),
      ),
    }
    const answer = await new HeuristicAgentEvaluator({ provider }).evaluate({
      agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
      userId: 'owner',
      test: {
        useWeights: true,
        testOptions: [],
        testStructure: [
          {
            id: 'h1',
            title: 'Clarity',
            questions: [{ id: 'q1' }, { id: 'q2' }],
          },
        ],
      },
      webTree: { root: { tag: 'html' } },
    })
    expect(provider.evaluate.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        answerMode: 'weight',
        studyMode: 'weights',
        options: [],
      }),
    )
    expect(provider.evaluate.mock.calls[0][0].questions).toHaveLength(1)
    expect(
      answer.toFirestore().heuristicQuestions[0].heuristicQuestions[0]
        .heuristicAnswer,
    ).toEqual({
      mode: 'weight',
      weight: 6,
      text: 'Weight: 6',
      value: 6,
    })
  })

  it('evaluates traditional heuristics once despite stored detailed questions', async () => {
    const provider = {
      evaluate: jest.fn(async ({ questions }) =>
        questions.map((q) => ({ ...q, frequency: 2, severity: 3 })),
      ),
    }
    const answer = await new HeuristicAgentEvaluator({ provider }).evaluate({
      agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
      userId: 'owner',
      test: {
        useFrequency: true,
        useSeverity: true,
        testOptions: [{ value: 1 }],
        testStructure: [
          {
            id: 'h1',
            title: 'Clarity',
            description: 'Keep users informed',
            questions: [
              { id: 'q1', title: 'Question 1' },
              { id: 'q2', title: 'Question 2' },
            ],
          },
        ],
      },
      webTree: { root: { tag: 'html' } },
    })
    const sent = provider.evaluate.mock.calls[0][0]
    expect(sent.studyMode).toBe('traditional')
    expect(sent.questions).toHaveLength(1)
    expect(sent.questions[0].question).toBe('Clarity')
    expect(sent.questions[0].descriptions).toEqual([
      { text: 'Keep users informed' },
    ])
    expect(answer.total).toBe(1)
    expect(answer.heuristicQuestions[0].heuristicQuestions).toHaveLength(1)
  })

  it('rejects out-of-range traditional metrics before reporting progress or saving', async () => {
    const saveAnswer = jest.fn()
    const onQuestionProgress = jest.fn()
    await expect(
      new HeuristicAgentEvaluator({
        provider: {
          evaluate: jest
            .fn()
            .mockResolvedValue([
              { heuristicId: 0, questionId: 0, frequency: 8, severity: 2 },
            ]),
        },
        saveAnswer,
      }).evaluateAndSave({
        agent: new HeuristicAgent({
          id: 'a1',
          name: 'Agent',
          ownerId: 'owner',
        }),
        userId: 'owner',
        test: {
          useFrequency: true,
          useSeverity: true,
          testStructure: [{ questions: [{}] }],
        },
        webTree: { root: { tag: 'html' } },
        onQuestionProgress,
      }),
    ).rejects.toThrow('invalid metric')
    expect(onQuestionProgress).not.toHaveBeenCalled()
    expect(saveAnswer).not.toHaveBeenCalled()
  })

  it('rejects use by a user the agent was not shared with', async () => {
    const evaluator = new HeuristicAgentEvaluator({
      provider: { evaluate: jest.fn() },
    })
    const agent = new HeuristicAgent({ name: 'Private', ownerId: 'owner' })
    await expect(
      evaluator.evaluate({ agent, userId: 'other', test: {}, webTree: {} }),
    ).rejects.toThrow('cannot use')
  })

  it('can persist the AI result as another evaluator answer', async () => {
    const saveAnswer = jest.fn()
    const evaluator = new HeuristicAgentEvaluator({
      saveAnswer,
      provider: {
        evaluate: jest
          .fn()
          .mockResolvedValue([{ heuristicId: 0, questionId: 0, answer: 1 }]),
      },
    })
    const context = {
      agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
      userId: 'owner',
      test: {
        testStructure: [{ questions: [{ text: 'Question' }] }],
        testOptions: [{ text: 'Yes', value: 1 }],
      },
      webTree: { root: { tag: 'html' } },
    }

    const answer = await evaluator.evaluateAndSave(context)
    expect(saveAnswer).toHaveBeenCalledWith(answer, context)
  })

  it('rejects an incomplete set of heuristic decisions before saving', async () => {
    const saveAnswer = jest.fn()
    const evaluator = new HeuristicAgentEvaluator({
      saveAnswer,
      provider: { evaluate: jest.fn().mockResolvedValue([]) },
    })
    await expect(
      evaluator.evaluateAndSave({
        agent: new HeuristicAgent({
          id: 'a1',
          name: 'Agent',
          ownerId: 'owner',
        }),
        userId: 'owner',
        test: {
          testStructure: [{ id: 'h1', questions: [{ id: 'q1' }] }],
          testOptions: [{ text: 'Yes', value: 1 }],
        },
        webTree: { root: { tag: 'html' } },
      }),
    ).rejects.toThrow('missing question h1:q1')
    expect(saveAnswer).not.toHaveBeenCalled()
  })
})
