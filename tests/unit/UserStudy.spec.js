import UserStudy from '@/ux/UserTest/models/UserStudy'
import StudyAdmin from '@/shared/models/StudyAdmin'

const testAdmin = new StudyAdmin({
  email: 'owner@example.com',
  userDocId: 'owner',
})

describe('UserStudy mobile task instructions', () => {
  it('defaults allowMobileTaskInstructions to on when the field is absent', () => {
    const study = new UserStudy({ testAdmin })

    expect(study.allowMobileTaskInstructions).toBe(true)
    expect(study.toFirestore().allowMobileTaskInstructions).toBe(true)
  })

  it('keeps the setting on when the stored value is true', () => {
    const study = new UserStudy({
      testAdmin,
      allowMobileTaskInstructions: true,
    })

    expect(study.toFirestore().allowMobileTaskInstructions).toBe(true)
  })

  it('persists false when the admin turns the setting off', () => {
    const study = new UserStudy({
      testAdmin,
      allowMobileTaskInstructions: false,
    })

    expect(study.allowMobileTaskInstructions).toBe(false)
    expect(study.toFirestore().allowMobileTaskInstructions).toBe(false)
  })
})
