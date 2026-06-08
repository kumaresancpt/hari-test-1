import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { loginRequest } from '../services/auth'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

jest.mock('../services/auth', () => ({
  loginRequest: jest.fn(),
  forgotPasswordRequest: jest.fn(),
  resetPasswordRequest: jest.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders login heading and role tabs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Receptionist' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Security Guard' })).toBeInTheDocument()
  })

  it('submits login payload with entered credentials', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockResolvedValue({
      token: 'token-123',
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

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'john@123')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'pass@123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() =>
      expect(loginRequest).toHaveBeenCalledWith({
        username: 'john@123',
        password: 'pass@123',
      }),
    )
  })

  it('stores access token and navigates using redirectUrl on success', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockResolvedValue({
      token: 'token-xyz',
      role: 'Receptionist',
      expiresAt: '2026-06-03T10:00:00Z',
      redirectUrl: '/dashboard/reception',
    })

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('tab', { name: 'Receptionist' }))
    await user.type(screen.getByPlaceholderText('ex., john@123'), 'jane@123')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'valid-pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(localStorage.getItem('accessToken')).toBe('token-xyz'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard/reception'))
  })

  it('shows invalid credential error message from API', async () => {
    ;(loginRequest as jest.MockedFunction<typeof loginRequest>).mockRejectedValue(
      new Error('Invalid username or password.'),
    )

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('ex., john@123'), 'bad-user')
    await user.type(screen.getByPlaceholderText('Please Enter'), 'bad-pass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText('Invalid username or password.')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('toggles password visibility state from show to hide', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const passwordInput = screen.getByPlaceholderText('Please Enter') as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    const showButton = screen.getByRole('button', { name: 'Show password' })
    await user.click(showButton)

    expect(passwordInput.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
  })
})