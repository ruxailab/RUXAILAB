import { exportStudySummary } from '@/shared/utils/studySummaryExport'
import { STUDY_ROLE } from '@/shared/utils/studyAccessPolicy'

const studyFor = (userId, role) => ({
  id: 'study-1',
  testType: 'USER',
  testTitle: 'Checkout study',
  testDescription: 'Summary source',
  testAdmin: { userDocId: 'owner' },
  cooperators: [{ userDocId: userId, accessLevel: role, accepted: true }],
})

describe('user-study summary export', () => {
  it('lets a Manager request and save the PDF', async () => {
    const user = { id: 'manager', accessLevel: 1 }
    const requestPdf = jest.fn().mockResolvedValue('pdf-bytes')
    const savePdf = jest.fn()

    const result = await exportStudySummary({
      study: studyFor(user.id, STUDY_ROLE.MANAGER),
      user,
      answers: [{ id: 'answer-1' }],
      requestPdf,
      savePdf,
      notifyDenied: jest.fn(),
    })

    expect(result).toEqual({ status: 'exported' })
    expect(requestPdf).toHaveBeenCalledWith({
      payload: {
        title: 'Checkout study',
        description: 'Summary source',
        type: 'USER',
        taskAnswers: [{ id: 'answer-1' }],
      },
    })
    expect(savePdf).toHaveBeenCalledWith('pdf-bytes', 'Checkout study.pdf')
  })

  it('notifies an Observator and sends no PDF request', async () => {
    const user = { id: 'observator', accessLevel: 1 }
    const requestPdf = jest.fn()
    const savePdf = jest.fn()
    const notifyDenied = jest.fn()

    const result = await exportStudySummary({
      study: studyFor(user.id, STUDY_ROLE.OBSERVATOR),
      user,
      answers: [],
      requestPdf,
      savePdf,
      notifyDenied,
    })

    expect(result).toEqual({ status: 'denied' })
    expect(notifyDenied).toHaveBeenCalledWith('AccessNotAllowed.noAccess')
    expect(requestPdf).not.toHaveBeenCalled()
    expect(savePdf).not.toHaveBeenCalled()
  })
})
