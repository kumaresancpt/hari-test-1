import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import * as authService from '../api/authService'

jest.mock('../api/authService', () => ({
  ...jest.requireActual('../api/authService'),
  register: jest.fn(),
}))

const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>

const RenderWithRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('SignupForm (RegisterForm with Router)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('1. Form renders with all input fields', () => {
    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
  })

  test('2. Form renders Create Account button and Log in link', () => {
    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument()
  })

  test('3. Form submission validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  test('4. Form accepts valid input and calls API', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({
      success: true,
      message: 'Registration successful',
      userId: '123',
    })

    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass123')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
      }))
    })
  })

  test('5. Form displays success message after registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({
      success: true,
      message: 'Registration successful!',
      userId: '123',
    })

    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '9876543210')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass456')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass456')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument()
    })
  })

  test('6. Form displays error messages on API failure', async () => {
    const user = userEvent.setup()
    const error = new authService.RegistrationError('Failed', {
      email: 'Email already exists',
    })
    mockRegister.mockRejectedValue(error)

    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Jane')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1111111111')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass456')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass456')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  test('7. Password visibility toggle works', async () => {
    const user = userEvent.setup()
    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement
    const toggleButton = screen.getByTestId('password-visibility-toggle')

    expect(passwordInput.type).toBe('password')
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
  })

  test('8. Password confirmation validation works', async () => {
    const user = userEvent.setup()
    render(
      <RenderWithRouter>
        <RegisterForm />
      </RenderWithRouter>
    )

    await user.type(screen.getByPlaceholderText('Enter your name'), 'John')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'DifferentPass123')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    })
  })
})
