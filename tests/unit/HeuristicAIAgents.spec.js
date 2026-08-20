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
    ).toContain('button[aria-label="Save"]')
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
          questionId: 'q1',
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
        agent: new HeuristicAgent({ id: 'a1', name: 'Agent', ownerId: 'owner' }),
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
