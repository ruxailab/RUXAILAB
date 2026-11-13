import assessment from '@/ux/accessibility/store/Assessment'
import * as assessmentController from '@/ux/accessibility/controllers/assessmentController'

jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('@/ux/accessibility/controllers/assessmentController', () => ({
  saveAssessment: jest.fn(),
  updateRuleAssessment: jest.fn(),
}))

const wcagData = {
  principles: [
    {
      title: 'Perceivable',
      Guidelines: [
        {
          title: 'Text Alternatives',
          rules: [{ id: '1.1.1', title: 'Non-text Content' }],
        },
      ],
    },
  ],
}

const stateWith = (extra = {}) => ({
  wcagData,
  ruleAssessments: {},
  ...extra,
})

describe('Assessment store', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saves the guideline title with a single rule assessment', async () => {
    await assessment.actions.updateRuleAssessment(
      { commit: jest.fn(), state: stateWith() },
      {
        userId: 'user-1',
        testId: 'test-1',
        ruleId: '1.1.1',
        assessment: { status: 'pass', guideline: 'Text Alternatives' },
      },
    )

    expect(assessmentController.updateRuleAssessment).toHaveBeenCalledWith(
      'user-1',
      'test-1',
      expect.objectContaining({
        ruleTitle: 'Non-text Content',
        principle: 'Perceivable',
        guideline: 'Text Alternatives',
      }),
    )
  })

  it('saves the guideline title when saving all assessments', async () => {
    await assessment.actions.saveAssessment(
      {
        state: stateWith({
          ruleAssessments: { '1.1.1': { status: 'pass' } },
        }),
      },
      { userId: 'user-1', testId: 'test-1' },
    )

    expect(assessmentController.saveAssessment).toHaveBeenCalledWith(
      'user-1',
      'test-1',
      'manual',
      [
        expect.objectContaining({
          ruleId: '1.1.1',
          guideline: 'Text Alternatives',
        }),
      ],
    )
  })
})
