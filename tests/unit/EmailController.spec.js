import EmailController from '@/shared/controllers/EmailController'
import { httpsCallable } from 'firebase/functions'

jest.mock('firebase/functions', () => ({
    httpsCallable: jest.fn()
}))

jest.mock('@/app/plugins/firebase', () => ({
    fbFunctions: {}
}))

describe('EmailController', () => {
    let emailController
    let consoleErrorSpy
    let mockSendEmailFunction

    beforeEach(() => {
        jest.clearAllMocks()
        mockSendEmailFunction = jest.fn()
        httpsCallable.mockReturnValue(mockSendEmailFunction)
        emailController = new EmailController()
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    describe('Structure', () => {
        it('should have send method', () => {
            expect(typeof emailController.send).toBe('function')
        })
    })

    describe('send', () => {
        it('should call httpsCallable with correct function name and payload', async () => {
            mockSendEmailFunction.mockResolvedValue({ data: {} })

            const payload = {
                to: 'test@example.com',
                subject: 'Test Subject',
                template: 'invitation',
                data: { name: 'Test User' }
            }

            await emailController.send(payload)

            expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'sendEmail')
            expect(mockSendEmailFunction).toHaveBeenCalledWith(payload)
        })

        it('should return success response when email is sent successfully', async () => {
            mockSendEmailFunction.mockResolvedValue({ data: {} })

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

        it('should return error response when httpsCallable fails', async () => {
            const mockError = new Error('Network error')
            mockSendEmailFunction.mockRejectedValue(mockError)

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
            mockSendEmailFunction.mockRejectedValue(mockError)

            const result = await emailController.send({
                to: 'invalid@test.com',
                subject: 'Test'
            })

            expect(result.success).toBe(false)
            expect(result.message).toBe('Internal Server Error')
        })
    })
})
