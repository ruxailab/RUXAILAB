import '@testing-library/jest-dom'
import { fireEvent, screen, render, renderWithMockStore } from '../test-utils'

import SignInView from '@/views/public/SignInView.vue'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
}))
import { signInWithEmailAndPassword } from 'firebase/auth'

global.console.error = jest.fn()
global.console.warn = jest.fn()

describe('SignIn', () => {

  it('should display email input', async () => {
    render(SignInView)
    expect(screen.getByLabelText(/Email/i, { selector: 'input' })).toBeInTheDocument()
  })
  it('should display password input', async () => {
    render(SignInView)
    expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument()
  })

  it('should display sign-in button', async () => {
    render(SignInView)
    expect(screen.getByRole('button', { name: /Sign\s+in/i })).toBeInTheDocument()
  })

  describe('when user type valid credentials', () => {
    it('should sign in', async () => {
      const { signin } = renderWithMockStore(SignInView)

      const emailInput = screen.getByLabelText(/^Email$/i)
      await fireEvent.update(emailInput, 'test@example.com')

      const passwordInput = screen.getByLabelText(/^Password$/i)
      await fireEvent.update(passwordInput, 'mypassword')

      const submitButton = screen.getByTestId('sign-in-button')
      await fireEvent.click(submitButton)

      expect(signin).toHaveBeenCalled()
      expect(signin).toHaveBeenCalledWith(expect.anything(), {
        email: 'test@example.com',
        password: 'mypassword',
      })
    })

  })
})
