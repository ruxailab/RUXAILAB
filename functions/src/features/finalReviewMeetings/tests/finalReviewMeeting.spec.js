import FinalReviewMeeting, {
  FINAL_REVIEW_OUTCOME,
  FINAL_REVIEW_STATUS,
} from '../models/FinalReviewMeeting.js'
import {
  assertCanManage,
  assertMeetingManager,
  assertDecisionTarget,
  collectExpertPositions,
  getSubmittedHumanEvaluations,
} from '../service/FinalReviewMeetingService.js'
import {
  canTransitionFinalReviewStatus,
  validateCreateFinalReviewMeeting,
  validateFinalReviewDecision,
  validateFinalReviewMinutes,
} from '../validators/finalReviewMeetingValidator.js'

describe('validateCreateFinalReviewMeeting', () => {
  const validInput = {
    studyId: 'study-1',
    title: 'Final expert review',
    participantIds: ['expert-1', 'expert-2'],
    facilitatorId: 'manager-1',
    agenda: [{ title: 'Review critical findings' }],
  }

  it('normalizes a valid meeting request', () => {
    expect(validateCreateFinalReviewMeeting(validInput)).toEqual({
      valid: true,
      value: {
        studyId: 'study-1',
        facilitatorId: 'manager-1',
        title: 'Final expert review',
        scheduledAt: null,
        timeZone: null,
        meetingLink: null,
        participantIds: ['expert-1', 'expert-2'],
        agenda: [
          { id: 'agenda-1', title: 'Review critical findings', order: 0 },
        ],
      },
    })
  })

    it('accepts only HTTPS meeting links without embedded credentials', () => {
    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        meetingLink: 'https://example.com/meeting',
      }).valid,
    ).toBe(true)

    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        meetingLink: 'http://example.com/meeting',
      }).valid,
    ).toBe(false)

    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        meetingLink: 'https://user@example.com/meeting',
      }).valid,
    ).toBe(false)

    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        meetingLink: 'https://user:password@example.com/meeting',
      }).valid,
    ).toBe(false)

    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        meetingLink: 'not-a-valid-url',
      }).valid,
    ).toBe(false)
  })



it('accepts an optional facilitator ID and defaults it to null', () => {
  const { facilitatorId, ...inputWithoutFacilitator } = validInput

  expect(
    validateCreateFinalReviewMeeting(inputWithoutFacilitator),
  ).toMatchObject({
    valid: true,
    value: { facilitatorId: null },
  })

  expect(
    validateCreateFinalReviewMeeting({
      ...inputWithoutFacilitator,
      facilitatorId: 'manager-1',
    }),
  ).toMatchObject({
    valid: true,
    value: { facilitatorId: 'manager-1' },
  })
})



  it('requires at least two unique human participants', () => {
    expect(
      validateCreateFinalReviewMeeting({ ...validInput, participantIds: [] })
        .valid,
    ).toBe(false)
    expect(
      validateCreateFinalReviewMeeting({ ...validInput, participantIds: ['expert-1'] })
        .valid,
    ).toBe(false)
    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        participantIds: ['expert-1', 'expert-1'],
      }).valid,
    ).toBe(false)
    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        participantIds: ['ai-agent:agent-1', 'expert-2'],
      }).valid,
    ).toBe(false)
  })

  it('rejects invalid scheduling and agenda data', () => {
    expect(
      validateCreateFinalReviewMeeting({ ...validInput, scheduledAt: -1 })
        .valid,
    ).toBe(false)
    expect(
      validateCreateFinalReviewMeeting({
        ...validInput,
        agenda: [{ title: ' ' }],
      }).valid,
    ).toBe(false)
  })
})

describe('validateFinalReviewDecision', () => {
  const validDecision = {
    heuristicId: 'heuristic-1',
    questionId: 2,
    outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
    rationale: 'Experts agreed after reviewing the evidence.',
    finalAssessment: { summary: 'Experts agree on severity 2' },
    unresolvedConcerns: [],
    actionItems: [],
  }

  it('normalizes a valid decision without accepting client-supplied expert positions', () => {
    const result = validateFinalReviewDecision(validDecision)

    expect(result.valid).toBe(true)
    expect(result.value.questionId).toBe('2')
    expect(result.value.finalAssessment).toEqual({ summary: 'Experts agree on severity 2' })
    expect(
      validateFinalReviewDecision({
        ...validDecision,
        expertPositions: [{ evaluatorId: 'expert-1', assessment: 'major' }],
      }).valid,
    ).toBe(false)
  })

  it('discards unsupported properties from final assessment and action items', () => {
    const result = validateFinalReviewDecision({
      ...validDecision,
      finalAssessment: {
        summary: 'Experts agree on severity 2',
        internalNote: 'must-not-be-persisted',
      },
      actionItems: [
        {
          description: 'Update the heuristic guidance',
          assigneeId: 'expert-1',
          dueAt: 1700000000000,
          privileged: true,
        },
      ],
    })

    expect(result.valid).toBe(true)
    expect(result.value.finalAssessment).toEqual({
      summary: 'Experts agree on severity 2',
    })
    expect(result.value.actionItems).toEqual([
      {
        description: 'Update the heuristic guidance',
        assigneeId: 'expert-1',
        dueAt: 1700000000000,
      },
    ])
  })

  it('requires a follow-up for deferred decisions', () => {
    expect(
      validateFinalReviewDecision({
        ...validDecision,
        outcome: FINAL_REVIEW_OUTCOME.DEFERRED,
        finalAssessment: null,
      }).valid,
    ).toBe(false)
    expect(
      validateFinalReviewDecision({
        ...validDecision,
        outcome: FINAL_REVIEW_OUTCOME.DEFERRED,
        finalAssessment: null,
        unresolvedConcerns: ['More evidence is required'],
      }).valid,
    ).toBe(true)
  })

  it('requires a supported outcome and rationale', () => {
    expect(
      validateFinalReviewDecision({ ...validDecision, outcome: 'APPROVED' })
        .valid,
    ).toBe(false)
    expect(
      validateFinalReviewDecision({
        ...validDecision,
        finalAssessment: { summary: ' ' },
      }).valid,
    ).toBe(false)
    expect(
      validateFinalReviewDecision({ ...validDecision, rationale: null }).valid,
    ).toBe(false)
  })
})

describe('final review lifecycle', () => {
  it('allows a draft to be scheduled or started', () => {
    expect(
      canTransitionFinalReviewStatus(
        FINAL_REVIEW_STATUS.DRAFT,
        FINAL_REVIEW_STATUS.SCHEDULED,
      ),
    ).toBe(true)
    expect(
      canTransitionFinalReviewStatus(
        FINAL_REVIEW_STATUS.DRAFT,
        FINAL_REVIEW_STATUS.IN_PROGRESS,
      ),
    ).toBe(true)
  })

  it('makes finalized and cancelled meetings terminal', () => {
    expect(
      canTransitionFinalReviewStatus(
        FINAL_REVIEW_STATUS.FINALIZED,
        FINAL_REVIEW_STATUS.IN_PROGRESS,
      ),
    ).toBe(false)
    expect(
      canTransitionFinalReviewStatus(
        FINAL_REVIEW_STATUS.CANCELLED,
        FINAL_REVIEW_STATUS.SCHEDULED,
      ),
    ).toBe(false)
  })

  it('validates meeting minutes', () => {
    expect(validateFinalReviewMinutes('Meeting summary').valid).toBe(true)
    expect(validateFinalReviewMinutes({}).valid).toBe(false)
  })
})


describe('final review source evaluation integrity', () => {
  const study = {
    testType: 'HEURISTIC',
    studyRoleMap: { 'expert-1': 1, 'expert-2': 1, 'guest-1': 2 },
    testStructure: [
      { id: 10, questions: [{ id: 101, title: 'Question 1' }] },
    ],
  }

  it('requires a submitted, visible answer from an accepted evaluator', () => {
    const answerDocument = {
      heuristicAnswers: {
        'expert-1': {
          userDocId: 'expert-1',
          submitted: true,
          hidden: false,
          heuristicQuestions: [],
        },
      },
    }
    expect(
      getSubmittedHumanEvaluations({
        study,
        answerDocument,
        participantIds: ['expert-1'],
      }),
    ).toHaveLength(1)
    expect(() =>
      getSubmittedHumanEvaluations({
        study,
        answerDocument,
        participantIds: ['guest-1'],
      }),
    ).toThrow('Every participant must be an accepted study evaluator')
  })

  it('excludes AI agents and incomplete or hidden evaluator submissions', () => {
    expect(() =>
      getSubmittedHumanEvaluations({
        study,
        answerDocument: { heuristicAnswers: {} },
        participantIds: ['ai-agent:agent-1'],
      }),
    ).toThrow('AI agents cannot participate as human experts')
    expect(() =>
      getSubmittedHumanEvaluations({
        study,
        answerDocument: {
          heuristicAnswers: {
            'expert-1': { userDocId: 'expert-1', submitted: false },
          },
        },
        participantIds: ['expert-1'],
      }),
    ).toThrow('Every participant must have a visible, submitted human evaluation')
  })

  it('derives expert positions from the immutable evaluation snapshot', () => {
    const snapshots = [
      {
        evaluatorId: 'expert-1',
        evaluation: {
          heuristicQuestions: [
            {
              heuristicId: 10,
              heuristicQuestions: [
                {
                  heuristicId: 101,
                  heuristicAnswer: { severity: 3 },
                  heuristicComment: 'Needs attention',
                },
              ],
            },
          ],
        },
      },
    ]
    expect(collectExpertPositions(snapshots, '10', '101')).toEqual([
      {
        evaluatorId: 'expert-1',
        assessment: { severity: 3 },
        comments: [{ id: 'legacy', text: 'Needs attention' }],
        recommendations: [],
        images: [],
        missing: false,
      },
    ])
    expect(
      collectExpertPositions(
        [{ evaluatorId: 'expert-2', evaluation: { heuristicQuestions: [] } }],
        '10',
        '101',
      ),
    ).toEqual([
      {
        evaluatorId: 'expert-2',
        assessment: null,
        comments: [],
        recommendations: [],
        images: [],
        missing: true,
      },
    ])
  })

  it('supports legacy image fallback and prefers modern evidence arrays', () => {
  const snapshots = [
    {
      evaluatorId: 'expert-1',
      evaluation: {
        heuristicQuestions: [
          {
            heuristicId: '10',
            heuristicQuestions: [
              {
                heuristicId: '101',
                heuristicComment: 'Legacy comment',
                answerImageUrl: 'https://example.com/legacy.png',
              },
            ],
          },
        ],
      },
    },
    {
      evaluatorId: 'expert-2',
      evaluation: {
        heuristicQuestions: [
          {
            heuristicId: '10',
            heuristicQuestions: [
              {
                heuristicId: '101',
                heuristicComment: 'Legacy comment',
                answerImageUrl: 'https://example.com/legacy.png',
                comments: [{ id: 'comment-1', text: 'Modern comment' }],
                images: [
                  { id: 'image-1', url: 'https://example.com/modern.png' },
                ],
              },
            ],
          },
        ],
      },
    },
  ]

  const positions = collectExpertPositions(snapshots, '10', '101')

  expect(positions[0]).toEqual(
    expect.objectContaining({
      evaluatorId: 'expert-1',
      comments: [{ id: 'legacy', text: 'Legacy comment' }],
      images: [{ id: 'legacy', url: 'https://example.com/legacy.png' }],
    }),
  )

  expect(positions[1]).toEqual(
    expect.objectContaining({
      evaluatorId: 'expert-2',
      comments: [{ id: 'comment-1', text: 'Modern comment' }],
      images: [{ id: 'image-1', url: 'https://example.com/modern.png' }],
    }),
  )
})

it('validates detailed studies against individual question IDs', () => {
  const detailedStudy = {
    ...study,
    useWeights: false,
    useFrequency: false,
    useSeverity: false,
    testOptions: [{ value: 'good', label: 'Good' }],
  }

  expect(() =>
    assertDecisionTarget(detailedStudy, {
      heuristicId: '10',
      questionId: '101',
    }),
  ).not.toThrow()

  expect(() =>
    assertDecisionTarget(detailedStudy, {
      heuristicId: '10',
      questionId: '10',
    }),
  ).toThrow('questionId does not belong to the selected heuristic')
})

it.each([
  ['frequency', { useFrequency: true, useSeverity: false }],
  ['severity', { useFrequency: false, useSeverity: true }],
  ['frequencySeverity', { useFrequency: true, useSeverity: true }],
  ['weight', { useWeights: true }],
])(
  'validates heuristic-level decision IDs for %s studies',
  (_mode, configuration) => {
    const configuredStudy = {
      ...study,
      ...configuration,
      testOptions: [],
    }

    expect(() =>
      assertDecisionTarget(configuredStudy, {
        heuristicId: '10',
        questionId: '10',
      }),
    ).not.toThrow()

    expect(() =>
      assertDecisionTarget(configuredStudy, {
        heuristicId: '10',
        questionId: '101',
      }),
    ).toThrow('questionId does not belong to the selected heuristic')
  },
)

it('supports legacy custom-option studies', () => {
  const legacyStudy = {
    ...study,
    useWeights: false,
    testOptions: [{ value: 'good', label: 'Good' }],
  }

  expect(() =>
    assertDecisionTarget(legacyStudy, {
      heuristicId: '10',
      questionId: '101',
    }),
  ).not.toThrow()
})
})


describe('FinalReviewMeeting model', () => {
  it('round-trips lifecycle metadata and keeps participant IDs unique', () => {
    const meeting = new FinalReviewMeeting({
      studyId: 'study-1',
      participantIds: ['expert-1', 'expert-1'],
      status: FINAL_REVIEW_STATUS.IN_PROGRESS,
      startedBy: 'manager-1',
      startedAt: 123,
      cancellationReason: 'Not used',
    })
    const saved = meeting.toFirestore()

    expect(saved.participantIds).toEqual(['expert-1'])
    expect(saved.startedBy).toBe('manager-1')
    expect(saved.startedAt).toBe(123)
    expect(saved.cancellationReason).toBe('Not used')
  })
})


describe('final review authorization', () => {
  const study = {
    testAdmin: { userDocId: 'owner-1' },
    studyRoleMap: { 'manager-1': 4, 'expert-1': 1 },
  }
  const meeting = { facilitatorId: 'manager-1' }

  it('allows the study owner and a mapped Manager to manage meetings', () => {
    expect(assertCanManage(study, 'owner-1')).toBe(0)
    expect(assertCanManage(study, 'manager-1')).toBe(4)
    expect(assertMeetingManager(study, meeting, 'manager-1')).toBe(4)
  })

  it('requires Managers to be mapped and assigned as the facilitator', () => {
    expect(() =>
      assertCanManage(
        { ...study, studyRoleMap: {} },
        'manager-1',
      ),
    ).toThrow('Managing final review meetings is not permitted')
    expect(() =>
      assertMeetingManager(study, { facilitatorId: 'another-manager' }, 'manager-1'),
    ).toThrow('Only the meeting facilitator or a study administrator can manage this meeting')
  })

  it('denies evaluators and guests from managing the meeting', () => {
    expect(() => assertCanManage(study, 'expert-1')).toThrow(
      'Managing final review meetings is not permitted',
    )
  })
})

describe('final review validator hardening', () => {
  const validMeeting = {
    studyId: 'study-1',
    title: 'Final expert review',
    participantIds: ['expert-1', 'expert-2'],
  }

  const validDecision = {
    heuristicId: 'heuristic-1',
    outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
    rationale: 'Experts agreed after reviewing the evidence.',
    finalAssessment: { summary: 'Agreed assessment' },
  }

  it('normalizes an empty or whitespace-only timezone to null', () => {
    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        timeZone: '   ',
      }),
    ).toMatchObject({ valid: true, value: { timeZone: null } })
  })

  it('rejects scheduled timestamps in the past', () => {
    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        scheduledAt: Date.now() - 60_000,
      }).valid,
    ).toBe(false)
  })

  it('rejects duplicate or invalid agenda identifiers', () => {
    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        agenda: [
          { id: 'agenda-1', title: 'First item' },
          { id: 'agenda-1', title: 'Second item' },
        ],
      }).valid,
    ).toBe(false)

    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        agenda: [{ id: '../invalid', title: 'Review findings' }],
      }).valid,
    ).toBe(false)
  })

  it('rejects unresolved concerns exceeding the individual length limit', () => {
    expect(
      validateFinalReviewDecision({
        ...validDecision,
        unresolvedConcerns: ['x'.repeat(2001)],
      }).valid,
    ).toBe(false)
  })

    it('rejects negative or duplicate agenda order values', () => {
    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        agenda: [{ title: 'First', order: -1 }],
      }).valid,
    ).toBe(false)

    expect(
      validateCreateFinalReviewMeeting({
        ...validMeeting,
        agenda: [
          { title: 'First', order: 1 },
          { title: 'Second', order: 1 },
        ],
      }).valid,
    ).toBe(false)
  })

  it('rejects fractional and unsafe action-item due timestamps', () => {
    for (const dueAt of [1700000000000.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(
        validateFinalReviewDecision({
          ...validDecision,
          actionItems: [{ description: 'Complete follow-up', dueAt }],
        }).valid,
      ).toBe(false)
    }
  })
})
