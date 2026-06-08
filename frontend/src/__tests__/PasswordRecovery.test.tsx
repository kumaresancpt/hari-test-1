import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { forgotPasswordRequest, resetPasswordRequest } from '../services/auth'

jest.mock('../services/auth', () => ({
  loginRequest: jest.fn(),
  forgotPasswordRequest: jest.fn(),
  resetPasswordRequest: jest.fn(),
}))

describe('PasswordRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('switches to forgot password view from login', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))

    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send OTP' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
  })

  it('calls forgot password API and transitions to reset view', async () => {
    ;(forgotPasswordRequest as jest.MockedFunction<typeof forgotPasswordRequest>).mockResolvedValue({
      message: 'OTP sent to registered email.',
      otpExpiresAt: '2026-06-03T22:30:00Z',
    })

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))
    await user.type(screen.getByPlaceholderText('name@example.com'), 'visitor@example.com')
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))

    await waitFor(() =>
      expect(forgotPasswordRequest).toHaveBeenCalledWith({ email: 'visitor@example.com' }),
    )
    expect(await screen.findByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
    expect(screen.getByText('OTP sent to registered email.')).toBeInTheDocument()
    expect(screen.getByText(/OTP expires at/i)).toBeInTheDocument()
  })

  it('supports direct navigation from forgot page to reset page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))
    await user.click(screen.getByRole('button', { name: 'Already have an OTP? Reset password' }))

    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter 6-digit OTP')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a new password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument()
  })

  it('submits reset password payload and returns to login view', async () => {
    ;(resetPasswordRequest as jest.MockedFunction<typeof resetPasswordRequest>).mockResolvedValue({
      message: 'Password reset complete.',
    })

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))
    await user.click(screen.getByRole('button', { name: 'Already have an OTP? Reset password' }))
    await user.type(screen.getByPlaceholderText('name@example.com'), 'visitor@example.com')
    await user.type(screen.getByPlaceholderText('Enter 6-digit OTP'), '123456')
    await user.type(screen.getByPlaceholderText('Create a new password'), 'NewPassword@1')
    await user.type(screen.getByPlaceholderText('Confirm your new password'), 'NewPassword@1')
    await user.click(screen.getByRole('button', { name: 'Reset Password' }))

    await waitFor(() =>
      expect(resetPasswordRequest).toHaveBeenCalledWith({
        email: 'visitor@example.com',
        otp: '123456',
        newPassword: 'NewPassword@1',
        confirmPassword: 'NewPassword@1',
      }),
    )
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Password reset complete.')).toBeInTheDocument()
  })

  it('shows API error message when reset password fails', async () => {
    ;(resetPasswordRequest as jest.MockedFunction<typeof resetPasswordRequest>).mockRejectedValue(
      new Error('Unable to reset password.'),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))
    await user.click(screen.getByRole('button', { name: 'Already have an OTP? Reset password' }))
    await user.type(screen.getByPlaceholderText('name@example.com'), 'visitor@example.com')
    await user.type(screen.getByPlaceholderText('Enter 6-digit OTP'), '123456')
    await user.type(screen.getByPlaceholderText('Create a new password'), 'NewPassword@1')
    await user.type(screen.getByPlaceholderText('Confirm your new password'), 'NewPassword@1')
    await user.click(screen.getByRole('button', { name: 'Reset Password' }))

    expect(await screen.findByText('Unable to reset password.')).toBeInTheDocument()
  })
})