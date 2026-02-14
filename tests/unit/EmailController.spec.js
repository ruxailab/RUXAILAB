import EmailController from '@/shared/controllers/EmailController'
import axios from 'axios'

jest.mock('axios', () => ({
    post: jest.fn()
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
            VUE_APP_CLOUD_FUNCTIONS_URL: 'https://cloud-functions.example.com'
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
        it('should call axios.post with correct URL and payload', async () => {
            axios.post.mockResolvedValue({ data: {} })

            const payload = {
                to: 'test@example.com',
                subject: 'Test Subject',
                template: 'invitation',
                data: { name: 'Test User' }
            }

            await emailController.send(payload)

            expect(axios.post).toHaveBeenCalledWith(
                'https://cloud-functions.example.com/sendEmail',
                { data: payload }
            )
        })

        it('should return success response when email is sent successfully', async () => {
            axios.post.mockResolvedValue({ data: {} })

            const payload = {
                to: 'test@example.com',
                subject: 'Test Subject',
                template: 'invitation'
            }

            const result = await emailController.send(payload)

            expect(result).toEqual({
                success: true,
                message: 'Email sent successfully.'
            })
        })

        it('should return error response when axios fails', async () => {
            const mockError = new Error('Network error')
            axios.post.mockRejectedValue(mockError)

            const payload = {
                to: 'test@example.com',
                subject: 'Test Subject',
                template: 'invitation'
            }

            const result = await emailController.send(payload)

            expect(result).toEqual({
                success: false,
                message: 'Network error'
            })
        })

        it('should handle server error responses', async () => {
            const mockError = new Error('Internal Server Error')
            axios.post.mockRejectedValue(mockError)

            const result = await emailController.send({
                to: 'invalid@test.com',
                subject: 'Test'
            })

            expect(result.success).toBe(false)
            expect(result.message).toBe('Internal Server Error')
        })
    })
})
