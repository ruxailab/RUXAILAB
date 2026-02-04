import EmailController from '@/shared/controllers/EmailController'
import httpClient from '@/app/services/http/axiosInstance'

jest.mock('@/app/services/http/axiosInstance', () => ({
  post: jest.fn(),
}))

describe('EmailController', () => {
  let emailController
  let consoleErrorSpy
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    emailController = new EmailController()
    process.env = {
      ...originalEnv,
      VUE_APP_CLOUD_FUNCTIONS_URL: 'https://cloud-functions.example.com',
    }
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env = originalEnv
    consoleErrorSpy.mockRestore()
  })

  describe('Structure', () => {
    it('should have send method', () => {
      expect(typeof emailController.send).toBe('function')
    })
  })

  describe('send', () => {
    it('should call httpClient.post with correct URL and payload', async () => {
      httpClient.post.mockResolvedValue({ data: {} })

      const payload = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'invitation',
        data: { name: 'Test User' },
      }

      await emailController.send(payload)

      expect(httpClient.post).toHaveBeenCalledWith(
        'https://cloud-functions.example.com/sendEmail',
        { data: payload },
      )
    })

    it('should return success response when email is sent successfully', async () => {
      httpClient.post.mockResolvedValue({ data: {} })

      const payload = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'invitation',
      }

      const result = await emailController.send(payload)

      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully.',
      })
    })

    it('should return error response when httpClient fails', async () => {
      const mockError = { message: 'Network error', code: 'NETWORK_ERROR' }
      httpClient.post.mockRejectedValue(mockError)

      const payload = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'invitation',
      }

      const result = await emailController.send(payload)

      expect(result).toEqual({
        success: false,
        message: 'Network error',
        code: 'NETWORK_ERROR',
      })
    })

    it('should handle server error responses', async () => {
      const mockError = { message: 'Internal Server Error', code: 'HTTP_500' }
      httpClient.post.mockRejectedValue(mockError)

      const result = await emailController.send({
        to: 'invalid@test.com',
        subject: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Internal Server Error')
    })
  })
})
