jest.mock('@/features/auth/controllers/AuthController', () => {
  const instance = {
    resetPassword: jest.fn(),
    sendVerificationEmail: jest.fn(),
  }
  const Controller = jest.fn().mockImplementation(() => instance)
  Controller.instance = instance
  return Controller
})

jest.mock('@/features/auth/controllers/UserController', () => {
  return jest.fn().mockImplementation(() => ({}))
})

jest.mock('@/shared/services/studyLoggingClient', () => ({
  cleanupStudyLoggingForOwner: jest.fn(),
}))

jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  requestStudyLoggingLogout: jest.fn(),
}))

import AuthModule from '@/features/auth/store/Auth'
import AuthController from '@/features/auth/controllers/AuthController'
import i18n from '@/app/plugins/i18n'

const controller = AuthController.instance
const toastsOf = (commit) =>
  commit.mock.calls
    .filter(([type]) => type === 'SET_TOAST')
    .map(([, toast]) => toast)

describe('Auth store email actions', () => {
  let commit

  beforeEach(() => {
    jest.clearAllMocks()
    commit = jest.fn()
  })

  describe('resetPassword', () => {
    it('shows the success toast when the email is sent', async () => {
      controller.resetPassword.mockResolvedValueOnce()

      await AuthModule.actions.resetPassword(
        { commit },
        { email: 'test@example.com' },
      )

      expect(toastsOf(commit)).toEqual([
        {
          message: i18n.global.t('auth.resetPasswordSuccess'),
          type: 'success',
        },
      ])
    })

    it('shows an error toast and rethrows when the email fails', async () => {
      const error = new Error('Network error')
      controller.resetPassword.mockRejectedValueOnce(error)

      await expect(
        AuthModule.actions.resetPassword(
          { commit },
          { email: 'test@example.com' },
        ),
      ).rejects.toBe(error)

      expect(toastsOf(commit)).toEqual([
        { message: i18n.global.t('errors.globalError'), type: 'error' },
      ])
      expect(commit).toHaveBeenLastCalledWith('setLoading', false)
    })
  })

  describe('sendVerificationEmail', () => {
    it('shows an error toast and rethrows when the email fails', async () => {
      const error = new Error('Internal Server Error')
      controller.sendVerificationEmail.mockRejectedValueOnce(error)

      await expect(
        AuthModule.actions.sendVerificationEmail(
          { commit },
          { email: 'test@example.com', userName: 'Test' },
        ),
      ).rejects.toBe(error)

      expect(toastsOf(commit)).toEqual([
        {
          message: i18n.global.t('auth.errorSendingVerification'),
          type: 'error',
        },
      ])
    })
  })
})
