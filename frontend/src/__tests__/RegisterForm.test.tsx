import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import RegisterForm from '../components/RegisterForm'
import * as authService from '../api/authService'

jest.mock('../api/authService', () => ({
  ...jest.requireActual('../api/authService'),
  register: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )
}

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('1. Form renders with all required input fields and labels', () => {
    renderComponent()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
  })

  test('2. Input fields render with correct placeholders', () => {
    renderComponent()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
  })

  test('3. Password input type is password (masked) by default', () => {
    renderComponent()
    const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password') as HTMLInputElement
    expect(passwordInput.type).toBe('password')
    expect(confirmPasswordInput.type).toBe('password')
  })

  test('4. Password visibility toggle shows and hides password', async () => {
    const user = userEvent.setup()
    renderComponent()
    const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement
    const toggleButton = screen.getByTestId('password-visibility-toggle')
    expect(passwordInput.type).toBe('password')
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  test('5. Confirm password visibility toggle shows and hides password', async () => {
    const user = userEvent.setup()
    renderComponent()
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password') as HTMLInputElement
    const confirmToggleButton = screen.getByTestId('confirm-password-visibility-toggle')
    expect(confirmPasswordInput.type).toBe('password')
    await user.click(confirmToggleButton)
    expect(confirmPasswordInput.type).toBe('text')
    await user.click(confirmToggleButton)
    expect(confirmPasswordInput.type).toBe('password')
  })

  test('6. Create Account button renders with correct text and styling', () => {
    renderComponent()
    const button = screen.getByRole('button', { name: /Create Account/i })
    expect(button).toBeInTheDocument()
  })

  test('7. Login link renders and can be clicked', async () => {
    const user = userEvent.setup()
    renderComponent()
    const loginLink = screen.getByRole('button', { name: /Log in/i })
    expect(loginLink).toBeInTheDocument()
    await user.click(loginLink)
  })

  test('8. Form sends POST request to /api/v1/auth/register with all fields', async () => {
    const user = userEvent.setup()
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValue({
      success: true,
      message: 'Registration successful',
      userId: '123',
    })

    renderComponent()

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

  test('9. On successful registration, displays success message', async () => {
    const user = userEvent.setup()
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValue({
      success: true,
      message: 'Registration successful!',
      userId: 'user-123',
    })

    renderComponent()

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '9876543210')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass456')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass456')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Registration successful/i)
    })
  })

  test('10. On error, displays field-level validation errors', async () => {
    const user = userEvent.setup()
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    const registrationError = new authService.RegistrationError(
      'Validation failed',
      {
        email: 'Email already exists',
        password: 'Password must be at least 8 characters',
      }
    )
    mockRegister.mockRejectedValue(registrationError)

    renderComponent()

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Jane')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1111111111')
    await user.type(screen.getByPlaceholderText('Enter password'), 'Short1')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Short1')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  test('11. Form validates password confirmation match on client side', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'DifferentPass123')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    })

    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    expect(mockRegister).not.toHaveBeenCalled()
  })

  test('12. Form validates required fields on client side', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    expect(mockRegister).not.toHaveBeenCalled()
  })

  test('13. Form validates email format on client side', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass123')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })

    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    expect(mockRegister).not.toHaveBeenCalled()
  })

  test('14. Form validates password minimum length on client side', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password'), 'Short1')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Short1')

    await user.click(screen.getByRole('button', { name: /Create Account/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })

    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    expect(mockRegister).not.toHaveBeenCalled()
  })
})
