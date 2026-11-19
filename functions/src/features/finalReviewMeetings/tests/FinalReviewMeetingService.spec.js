import { jest } from '@jest/globals'
import { FinalReviewMeetingService } from '../service/FinalReviewMeetingService.js'
import { FINAL_REVIEW_OUTCOME, FINAL_REVIEW_STATUS } from '../models/FinalReviewMeeting.js'

const snapshot = (data, id = undefined) => ({
  exists: data !== null,
  id,
  data: () => data,
})

const study = {
  testType: 'HEURISTIC',
  answersDocId: 'answers-1',
  testAdmin: { userDocId: 'owner-1' },
  studyRoleMap: {
    'manager-1': 4,
    'manager-2': 4,
    'admin-2': 0,
    'expert-1': 1,
    'expert-2': 1,
  },
  studyMode: 'detailed',
  testOptions: [{ value: 'good', label: 'Good' }],
  testStructure: [
    { id: 10, questions: [{ id: 101, title: 'Visibility' }] },
  ],
}

const answer = (userDocId, heuristicAnswer = { severity: 2 }) => ({
  userDocId,
  submitted: true,
  hidden: false,
  lastUpdate: 1700000000000,
  heuristicQuestions: [
    {
      heuristicId: 10,
      heuristicQuestions: [
        {
          heuristicId: 101,
          heuristicAnswer,
          heuristicComment: `Comment from ${userDocId}`,
          heuristicRecommendation: 'Improve the label',
        },
      ],
    },
  ],
})

const makeTransaction = (overrides = {}) => ({
  getStudy: jest.fn().mockResolvedValue(snapshot(study, 'study-1')),
  getUser: jest.fn().mockResolvedValue(snapshot({ accessLevel: 1 }, 'manager-1')),
  getAnswers: jest.fn().mockResolvedValue(
    snapshot({
      type: 'HEURISTIC',
      studyId: 'study-1',
      heuristicAnswers: {
        'expert-1': answer('expert-1'),
        'expert-2': answer('expert-2', { severity: 3 }),
      },
    }),
  ),
  getMeeting: jest.fn().mockResolvedValue(
    snapshot({
      title: 'Final review',
      status: FINAL_REVIEW_STATUS.IN_PROGRESS,
      facilitatorId: 'manager-1',
      participantIds: ['expert-1', 'expert-2'],
    }),
  ),
  getSourceEvaluations: jest.fn().mockResolvedValue({
    docs: [
      { id: 'expert-1', data: () => ({ evaluation: answer('expert-1') }) },
      { id: 'expert-2', data: () => ({ evaluation: answer('expert-2', { severity: 3 }) }) },
    ],
  }),
  getDecision: jest.fn().mockResolvedValue(snapshot(null)),
  getDecisions: jest.fn().mockResolvedValue({ empty: false, size: 1 }),
  createMeeting: jest.fn().mockReturnValue('meeting-1'),
  createSourceEvaluation: jest.fn(),
  createDecisionHistory: jest.fn(),
  setDecision: jest.fn(),
  updateMeeting: jest.fn(),
  serverTimestamp: jest.fn().mockReturnValue('server-time'),
  writeAuditEvent: jest.fn(),
  ...overrides,
})

const makeService = (transaction) => {
  const repository = {
    runTransaction: jest.fn((callback) => callback(transaction)),
  }
  return { service: new FinalReviewMeetingService({ repository }), repository }
}

describe('FinalReviewMeetingService', () => {
  it('creates a meeting with server-captured submitted human evaluations', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    const result = await service.create({
      uid: 'manager-1',
      input: {
        studyId: 'study-1',
        title: 'Final review',
        participantIds: ['expert-1', 'expert-2'],
        agenda: [{ title: 'Review differences' }],
      },
    })

    expect(result).toEqual({ meetingId: 'meeting-1', status: FINAL_REVIEW_STATUS.DRAFT })
    expect(transaction.createMeeting).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({
        facilitatorId: 'manager-1',
        participantIds: ['expert-1', 'expert-2'],
        sourceSnapshot: expect.objectContaining({
          evaluatorIds: ['expert-1', 'expert-2'],
        }),
      }),
    )
    expect(transaction.createSourceEvaluation).toHaveBeenCalledTimes(2)
    expect(transaction.writeAuditEvent).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({ action: 'heuristic.finalReviewCreated' }),
    )
  })

  it('starts a draft meeting and records the facilitator and audit event', async () => {
    const transaction = makeTransaction({
      getMeeting: jest.fn().mockResolvedValue(
        snapshot({
          title: 'Final review',
          status: FINAL_REVIEW_STATUS.DRAFT,
          facilitatorId: 'manager-1',
          participantIds: ['expert-1', 'expert-2'],
        }),
      ),
    })

    const { service } = makeService(transaction)

    const result = await service.start({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
    })

    expect(result).toEqual({
      meetingId: 'meeting-1',
      status: FINAL_REVIEW_STATUS.IN_PROGRESS,
    })

    expect(transaction.updateMeeting).toHaveBeenCalledWith(
      'study-1',
      'meeting-1',
      expect.objectContaining({
        status: FINAL_REVIEW_STATUS.IN_PROGRESS,
        startedBy: 'manager-1',
        startedAt: 'server-time',
        updatedAt: 'server-time',
      }),
    )

    expect(transaction.writeAuditEvent).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({
        action: 'heuristic.finalReviewStarted',
        actorId: 'manager-1',
      }),
    )
  })


  it('allows assigning another authorized Manager as facilitator', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    await service.create({
      uid: 'manager-1',
      input: {
        studyId: 'study-1',
        title: 'Final review',
        participantIds: ['expert-1', 'expert-2'],
        facilitatorId: 'manager-2',
        agenda: [{ title: 'Review differences' }],
      },
    })

    expect(transaction.getUser).toHaveBeenCalledWith('manager-2')
    expect(transaction.createMeeting).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({
        facilitatorId: 'manager-2',
      }),
    )
  })

  it('allows assigning a study Admin as facilitator', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    await service.create({
      uid: 'manager-1',
      input: {
        studyId: 'study-1',
        title: 'Final review',
        participantIds: ['expert-1', 'expert-2'],
        facilitatorId: 'admin-2',
        agenda: [{ title: 'Review differences' }],
      },
    })

    expect(transaction.getUser).toHaveBeenCalledWith('admin-2')
    expect(transaction.createMeeting).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({
        facilitatorId: 'admin-2',
      }),
    )
  })

  it('rejects an ordinary evaluator as facilitator', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    await expect(
      service.create({
        uid: 'manager-1',
        input: {
          studyId: 'study-1',
          title: 'Final review',
          participantIds: ['expert-1', 'expert-2'],
          facilitatorId: 'expert-1',
          agenda: [{ title: 'Review differences' }],
        },
      }),
    ).rejects.toThrow('Managing final review meetings is not permitted')

    expect(transaction.createMeeting).not.toHaveBeenCalled()
  })

  it('rejects a nonexistent facilitator', async () => {
    const transaction = makeTransaction({
      getUser: jest.fn().mockImplementation(async (uid) => {
        if (uid === 'missing-user') return snapshot(null, uid)
        return snapshot({ accessLevel: 1 }, uid)
      }),
    })

    const { service } = makeService(transaction)

    await expect(
      service.create({
        uid: 'manager-1',
        input: {
          studyId: 'study-1',
          title: 'Final review',
          participantIds: ['expert-1', 'expert-2'],
          facilitatorId: 'missing-user',
          agenda: [{ title: 'Review differences' }],
        },
      }),
    ).rejects.toThrow(
      'Selected facilitator is not authorized for this study',
    )

    expect(transaction.createMeeting).not.toHaveBeenCalled()
  })


  it('cancels a scheduled meeting and records the reason and audit event', async () => {
    const transaction = makeTransaction({
      getMeeting: jest.fn().mockResolvedValue(
        snapshot({
          title: 'Final review',
          status: FINAL_REVIEW_STATUS.SCHEDULED,
          facilitatorId: 'manager-1',
          participantIds: ['expert-1', 'expert-2'],
        }),
      ),
    })

    const { service } = makeService(transaction)

    const result = await service.cancel({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
      reason: 'The review needs to be rescheduled.',
    })

    expect(result).toEqual({
      meetingId: 'meeting-1',
      status: FINAL_REVIEW_STATUS.CANCELLED,
    })

    expect(transaction.updateMeeting).toHaveBeenCalledWith(
      'study-1',
      'meeting-1',
      expect.objectContaining({
        status: FINAL_REVIEW_STATUS.CANCELLED,
        cancellationReason: 'The review needs to be rescheduled.',
        cancelledBy: 'manager-1',
        cancelledAt: 'server-time',
        updatedAt: 'server-time',
      }),
    )

    expect(transaction.writeAuditEvent).toHaveBeenCalledWith(
      'study-1',
      expect.objectContaining({
        action: 'heuristic.finalReviewCancelled',
        actorId: 'manager-1',
      }),
    )
  })

  it('rejects malformed top-level heuristic evaluation data', async () => {
  const malformedAnswer = {
    ...answer('expert-1'),
    heuristicQuestions: 'invalid',
  }

  const transaction = makeTransaction({
    getAnswers: jest.fn().mockResolvedValue(
      snapshot({
        type: 'HEURISTIC',
        studyId: 'study-1',
        heuristicAnswers: {
          'expert-1': malformedAnswer,
          'expert-2': answer('expert-2'),
        },
      }),
    ),
  })
  const { service } = makeService(transaction)

  await expect(
    service.create({
      uid: 'manager-1',
      input: {
        studyId: 'study-1',
        title: 'Final review',
        participantIds: ['expert-1', 'expert-2'],
      },
    }),
  ).rejects.toThrow('An evaluation contains invalid heuristic data')

  expect(transaction.createMeeting).not.toHaveBeenCalled()
})

it('rejects malformed nested heuristic question data', async () => {
  const malformedAnswer = {
    ...answer('expert-1'),
    heuristicQuestions: [
      {
        heuristicId: 10,
        heuristicQuestions: 'invalid',
      },
    ],
  }

  const transaction = makeTransaction({
    getAnswers: jest.fn().mockResolvedValue(
      snapshot({
        type: 'HEURISTIC',
        studyId: 'study-1',
        heuristicAnswers: {
          'expert-1': malformedAnswer,
          'expert-2': answer('expert-2'),
        },
      }),
    ),
  })
  const { service } = makeService(transaction)

  await expect(
    service.create({
      uid: 'manager-1',
      input: {
        studyId: 'study-1',
        title: 'Final review',
        participantIds: ['expert-1', 'expert-2'],
      },
    }),
  ).rejects.toThrow('A heuristic contains invalid question data')

  expect(transaction.createMeeting).not.toHaveBeenCalled()
})

  it('rejects a combined snapshot that exceeds the transaction payload budget', async () => {
    const participantIds = Array.from({ length: 10 }, (_, index) => `expert-${index}`)
    const heuristicAnswers = Object.fromEntries(
      participantIds.map((id) => [
        id,
        {
          ...answer(id),
          heuristicQuestions: [
            {
              heuristicId: 10,
              heuristicQuestions: [
                {
                  heuristicId: 101,
                  heuristicAnswer: { severity: 2 },
                  heuristicRecommendation: 'x'.repeat(850 * 1024),
                },
              ],
            },
          ],
        },
      ]),
    )
    const transaction = makeTransaction({
      getStudy: jest.fn().mockResolvedValue(
        snapshot({
          ...study,
          studyRoleMap: { 'manager-1': 4, ...Object.fromEntries(participantIds.map((id) => [id, 1])) },
        }, 'study-1'),
      ),
      getAnswers: jest.fn().mockResolvedValue(
        snapshot({ type: 'HEURISTIC', studyId: 'study-1', heuristicAnswers }),
      ),
    })
    const { service } = makeService(transaction)

    await expect(
      service.create({
        uid: 'manager-1',
        input: { studyId: 'study-1', title: 'Final review', participantIds },
      }),
    ).rejects.toThrow('The selected evaluator submissions are too large to snapshot in one final review')
    expect(transaction.createMeeting).not.toHaveBeenCalled()
  })

  it('does not create a meeting when a selected evaluator has not submitted', async () => {
    const transaction = makeTransaction({
      getAnswers: jest.fn().mockResolvedValue(
        snapshot({
          type: 'HEURISTIC',
          studyId: 'study-1',
          heuristicAnswers: { 'expert-1': answer('expert-1') },
        }),
      ),
    })
    const { service } = makeService(transaction)

    await expect(
      service.create({
        uid: 'manager-1',
        input: {
          studyId: 'study-1',
          title: 'Final review',
          participantIds: ['expert-1', 'expert-2'],
        },
      }),
    ).rejects.toThrow('Every participant must have a visible, submitted human evaluation')
    expect(transaction.createMeeting).not.toHaveBeenCalled()
  })

  it('records expert positions from snapshots rather than client-supplied positions', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    const result = await service.saveDecision({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
      input: {
        heuristicId: '10',
        questionId: '101',
        outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
        rationale: 'The experts reviewed the evidence.',
        finalAssessment: { summary: 'Severity should be addressed.' },
      },
    })

    expect(result).toEqual({
      meetingId: 'meeting-1',
      decisionId: 'WyIxMCIsIjEwMSJd',
      status: 'saved',
    })
    expect(transaction.setDecision).toHaveBeenCalledWith(
      'study-1',
      'meeting-1',
      'WyIxMCIsIjEwMSJd',
      expect.objectContaining({
        expertPositions: expect.arrayContaining([
          expect.objectContaining({ evaluatorId: 'expert-1', assessment: { severity: 2 } }),
          expect.objectContaining({ evaluatorId: 'expert-2', assessment: { severity: 3 } }),
        ]),
      }),
    )
  })

  it('generates distinct decision IDs for targets that previously collided', async () => {
  const collisionStudy = {
    ...study,
    testStructure: [
      { id: 'a__question-b', questions: [] },
      { id: 'a', questions: [{ id: 'b__overall' }] },
    ],
  }

  const transaction = makeTransaction({
    getStudy: jest.fn().mockResolvedValue(
      snapshot(collisionStudy, 'study-1'),
    ),
  })

  const { service } = makeService(transaction)

  await service.saveDecision({
    uid: 'manager-1',
    studyId: 'study-1',
    meetingId: 'meeting-1',
    input: {
      heuristicId: 'a__question-b',
      outcome: FINAL_REVIEW_OUTCOME.DISAGREEMENT,
      rationale: 'First decision target.',
    },
  })

  await service.saveDecision({
    uid: 'manager-1',
    studyId: 'study-1',
    meetingId: 'meeting-1',
    input: {
      heuristicId: 'a',
      questionId: 'b__overall',
      outcome: FINAL_REVIEW_OUTCOME.DISAGREEMENT,
      rationale: 'Second decision target.',
    },
  })

  const decisionIds = transaction.setDecision.mock.calls.map(
    (call) => call[2],
  )

  expect(decisionIds).toHaveLength(2)
  expect(new Set(decisionIds).size).toBe(2)
})

    it('rejects a complete decision payload that exceeds the document size limit', async () => {
    const largeEvaluation = answer('expert-1')
    largeEvaluation.heuristicQuestions[0].heuristicQuestions[0].heuristicComment =
      'x'.repeat(885 * 1024)

    const transaction = makeTransaction({
      getSourceEvaluations: jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'expert-1',
            data: () => ({ evaluation: largeEvaluation }),
          },
          {
            id: 'expert-2',
            data: () => ({
              evaluation: answer('expert-2', { severity: 3 }),
            }),
          },
        ],
      }),
    })

    const { service } = makeService(transaction)

    await expect(
      service.saveDecision({
        uid: 'manager-1',
        studyId: 'study-1',
        meetingId: 'meeting-1',
        input: {
          heuristicId: '10',
          questionId: '101',
          outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
          rationale: 'r'.repeat(10000),
          finalAssessment: {
            summary: 's'.repeat(10000),
          },
        },
      }),
    ).rejects.toThrow('The complete decision is too large to store')

    expect(transaction.setDecision).not.toHaveBeenCalled()
  })

  it('preserves successive decision revisions and original creation metadata', async () => {
    const originalCreatedAt = 'original-created-at'

    const revisionOne = {
      outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
      rationale: 'Initial agreement',
      revision: 1,
      createdBy: 'manager-1',
      createdAt: originalCreatedAt,
    }

    const revisionTwo = {
      ...revisionOne,
      rationale: 'Updated agreement',
      revision: 2,
      updatedBy: 'manager-1',
    }

    const transaction = makeTransaction({
      getDecision: jest.fn()
        .mockResolvedValueOnce(snapshot(revisionOne))
        .mockResolvedValueOnce(snapshot(revisionTwo)),
    })

    const { service } = makeService(transaction)

    const input = {
      heuristicId: '10',
      questionId: '101',
      outcome: FINAL_REVIEW_OUTCOME.CONSENSUS,
      rationale: 'Final agreed position',
      finalAssessment: {
        summary: 'The experts agree on severity 2.',
      },
    }

    await service.saveDecision({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
      input,
    })

    await service.saveDecision({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
      input,
    })

    expect(transaction.createDecisionHistory).toHaveBeenCalledTimes(2)

    expect(transaction.createDecisionHistory).toHaveBeenNthCalledWith(
      1,
      'study-1',
      'meeting-1',
      expect.objectContaining({
        decisionId: 'WyIxMCIsIjEwMSJd',
        previousRevision: 1,
        decision: revisionOne,
        replacedBy: 'manager-1',
      }),
    )

    expect(transaction.createDecisionHistory).toHaveBeenNthCalledWith(
      2,
      'study-1',
      'meeting-1',
      expect.objectContaining({
        decisionId:'WyIxMCIsIjEwMSJd',
        previousRevision: 2,
        decision: revisionTwo,
        replacedBy: 'manager-1',
      }),
    )

    const savedRevisions = transaction.setDecision.mock.calls.map(
      (call) => call[3],
    )

    expect(savedRevisions.map((decision) => decision.revision)).toEqual([2, 3])

    for (const decision of savedRevisions) {
      expect(decision.createdBy).toBe('manager-1')
      expect(decision.createdAt).toBe(originalCreatedAt)
      expect(decision.updatedBy).toBe('manager-1')
    }

    expect(transaction.writeAuditEvent).toHaveBeenCalledTimes(2)

    expect(transaction.writeAuditEvent).toHaveBeenNthCalledWith(
      1,
      'study-1',
      expect.objectContaining({
        action: 'heuristic.finalReviewDecisionUpdated',
        details: expect.objectContaining({ revision: 2 }),
      }),
    )

    expect(transaction.writeAuditEvent).toHaveBeenNthCalledWith(
      2,
      'study-1',
      expect.objectContaining({
        action: 'heuristic.finalReviewDecisionUpdated',
        details: expect.objectContaining({ revision: 3 }),
      }),
    )
  })

  it('rejects source snapshots that do not match the meeting participants', async () => {
    const transaction = makeTransaction({
      getSourceEvaluations: jest.fn().mockResolvedValue({
        docs: [
          { id: 'expert-1', data: () => ({ evaluation: answer('expert-1') }) },
          { id: 'unexpected-expert', data: () => ({ evaluation: answer('unexpected-expert') }) },
        ],
      }),
    })
    const { service } = makeService(transaction)

    await expect(
      service.saveDecision({
        uid: 'manager-1',
        studyId: 'study-1',
        meetingId: 'meeting-1',
        input: {
          heuristicId: '10',
          questionId: '101',
          outcome: FINAL_REVIEW_OUTCOME.DISAGREEMENT,
          rationale: 'The experts disagree.',
        },
      }),
    ).rejects.toThrow('The source evaluation snapshot is incomplete for this meeting')
    expect(transaction.setDecision).not.toHaveBeenCalled()
  })

  it('requires the facilitator or an administrator to record decisions', async () => {
    const transaction = makeTransaction({
      getUser: jest.fn().mockResolvedValue(snapshot({ accessLevel: 1 })),
    })
    const { service } = makeService(transaction)

    await expect(
      service.saveDecision({
        uid: 'expert-1',
        studyId: 'study-1',
        meetingId: 'meeting-1',
        input: {
          heuristicId: '10',
          questionId: '101',
          outcome: FINAL_REVIEW_OUTCOME.DISAGREEMENT,
          rationale: 'The experts disagree.',
        },
      }),
    ).rejects.toThrow('Only the meeting facilitator or a study administrator can manage this meeting')
    expect(transaction.setDecision).not.toHaveBeenCalled()
  })

  it('finalizes only an in-progress meeting with decisions and non-empty minutes', async () => {
    const transaction = makeTransaction()
    const { service } = makeService(transaction)

    const result = await service.finalize({
      uid: 'manager-1',
      studyId: 'study-1',
      meetingId: 'meeting-1',
      minutes: 'The experts agreed on the final assessment.',
    })

    expect(result).toEqual({ meetingId: 'meeting-1', status: FINAL_REVIEW_STATUS.FINALIZED })
    expect(transaction.updateMeeting).toHaveBeenCalledWith(
      'study-1',
      'meeting-1',
      expect.objectContaining({
        status: FINAL_REVIEW_STATUS.FINALIZED,
        minutes: 'The experts agreed on the final assessment.',
        finalizedBy: 'manager-1',
      }),
    )
  })

  it('does not allow a finalized meeting to be cancelled', async () => {
    const transaction = makeTransaction({
      getMeeting: jest.fn().mockResolvedValue(
        snapshot({
          title: 'Final review',
          status: FINAL_REVIEW_STATUS.FINALIZED,
          facilitatorId: 'manager-1',
          participantIds: ['expert-1', 'expert-2'],
        }),
      ),
    })
    const { service } = makeService(transaction)

    await expect(
      service.cancel({ uid: 'manager-1', studyId: 'study-1', meetingId: 'meeting-1' }),
    ).rejects.toThrow('This meeting cannot be cancelled from its current status')
    expect(transaction.updateMeeting).not.toHaveBeenCalled()
  })
  it('captures only the required evaluation fields while preserving evidence metadata', async () => {
  const expertAnswer = {
    ...answer('expert-1'),
    privateEvaluatorMetadata: 'must-not-be-copied',
    heuristicQuestions: [
      {
        heuristicId: 10,
        unrelatedParentField: 'must-not-be-copied',
        heuristicQuestions: [
          {
            heuristicId: 101,
            heuristicAnswer: { severity: 2 },
            heuristicComment: 'Original comment',
            heuristicRecommendation: 'Improve the label',
            answerImageUrl: 'https://example.com/legacy.png',
            comments: [
              { id: 'comment-1', text: 'Needs improvement' },
            ],
            images: [
              {
                id: 'image-1',
                url: 'https://example.com/evidence.png',
                type: 'image',
                metadata: { width: 800, height: 600 },
              },
            ],
            unrelatedQuestionField: 'must-not-be-copied',
          },
        ],
      },
    ],
  }

  const transaction = makeTransaction({
    getAnswers: jest.fn().mockResolvedValue(
      snapshot({
        type: 'HEURISTIC',
        studyId: 'study-1',
        heuristicAnswers: {
          'expert-1': expertAnswer,
          'expert-2': answer('expert-2'),
        },
      }),
    ),
  })
  const { service } = makeService(transaction)

  await service.create({
    uid: 'manager-1',
    input: {
      studyId: 'study-1',
      title: 'Final review',
      participantIds: ['expert-1', 'expert-2'],
    },
  })

  const captured = transaction.createSourceEvaluation.mock.calls
    .find((call) => call[2] === 'expert-1')[3]

  expect(captured).toEqual(
    expect.objectContaining({
      evaluatorId: 'expert-1',
      evaluation: {
        heuristicQuestions: [
          {
            heuristicId: 10,
            heuristicQuestions: [
              {
                heuristicId: 101,
                heuristicAnswer: { severity: 2 },
                heuristicComment: 'Original comment',
                heuristicRecommendation: 'Improve the label',
                answerImageUrl: 'https://example.com/legacy.png',
                comments: [
                  { id: 'comment-1', text: 'Needs improvement' },
                ],
                images: [
                  {
                    id: 'image-1',
                    url: 'https://example.com/evidence.png',
                    type: 'image',
                    metadata: { width: 800, height: 600 },
                  },
                ],
              },
            ],
          },
        ],
      },
    }),
  )

  expect(captured.evaluation).not.toHaveProperty('privateEvaluatorMetadata')
  expect(captured.evaluation.heuristicQuestions[0])
    .not.toHaveProperty('unrelatedParentField')
  expect(captured.evaluation.heuristicQuestions[0].heuristicQuestions[0])
    .not.toHaveProperty('unrelatedQuestionField')
})
})
