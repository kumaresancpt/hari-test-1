import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { loginRequest } from '../services/auth'

jest.mock('../services/auth', () => ({
  loginRequest: jest.fn(),
  forgotPasswordRequest: jest.fn(),
  resetPasswordRequest: jest.fn(),
}))

describe('LockoutPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders server lockout message when login API returns lockout error', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockRejectedValue(
      new Error('Account locked due to too many failed attempts. Try again in 10 minutes.'),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'locked-user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'locked-pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(
      await screen.findByText('Account locked due to too many failed attempts. Try again in 10 minutes.'),
    ).toBeInTheDocument()
  })

  it('disables submit button while login request is in flight', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockImplementation(
      () => new Promise(() => undefined),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled()
  })

  it('blocks second submit click while request is pending', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockImplementation(
      () => new Promise(() => undefined),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'pass')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await user.click(submitButton)
    await user.click(screen.getByRole('button', { name: 'Signing In...' }))

    expect(loginRequest).toHaveBeenCalledTimes(1)
  })

  it('clears previous lockout error on next successful login', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>)
      .mockRejectedValueOnce(
        new Error('Account locked due to too many failed attempts. Try again in 5 minutes.'),
      )
      .mockResolvedValueOnce({
        token: 'ok-token',
        role: 'Admin',
        expiresAt: '2026-06-03T10:00:00Z',
        redirectUrl: '/dashboard',
      })

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(
      await screen.findByText('Account locked due to too many failed attempts. Try again in 5 minutes.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() =>
      expect(screen.queryByText(/Account locked due to too many failed attempts/i)).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('Login succeeded for Admin. Redirecting...')).toBeInTheDocument()
  })

  it('keeps username and password field labels visible during lockout error state', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockRejectedValue(
      new Error('Account locked due to too many failed attempts. Try again in 9 minutes.'),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'locked-user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'locked-pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText(/Account locked due to too many failed attempts/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ex., john@123')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Please Enter')).toBeInTheDocument()
  })
})