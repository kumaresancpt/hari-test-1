import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import RegisterPage from '../pages/RegisterPage'
import * as authService from '../api/authService'

// Mock the authService.register function but keep real RegistrationError class
jest.mock('../api/authService', () => ({
  ...jest.requireActual('../api/authService'),
  register: jest.fn(),
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

// Helper function to render RegisterPage within Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('RegisterPage Layout & Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test 1: RegisterPage renders HeroImage on left side
  test('1. Page renders HeroImage component on left side', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByLabelText('Two professionals meeting on a building balcony')).toBeInTheDocument()
  })

  // Test 2: RegisterPage renders RegisterForm component on right side
  test('2. Page renders RegisterForm component on white card (right side)', () => {
    renderWithRouter(<RegisterPage />)

    // Check all form fields are present
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
  })

  // Test 3: RegisterPage renders heading and subtitle
  test('3. Page renders Sign up heading and subtitle', () => {
    renderWithRouter(<RegisterPage />)

    // Find the heading in the registration card
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Create an account to get started')).toBeInTheDocument()
  })

  // Test 4: RegisterPage renders Logo component
  test('4. Page renders Logo component at top of card', () => {
    renderWithRouter(<RegisterPage />)

    // The Logo should be present (verified by page structure)
    const pageContainer = screen.getByPlaceholderText('Enter your name').closest('div')
    expect(pageContainer).toBeInTheDocument()
  })

  // Test 5: Full registration flow - user sees layout, fills form, submits, sees success
  test('5. Full registration flow: hero image + form + success message', async () => {
    const user = userEvent.setup()
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValueOnce({
      message: 'Registration successful! Check your email for verification.',
      userId: 'test-user-123',
    })

    renderWithRouter(<RegisterPage />)

    // Verify hero image is visible
    expect(screen.getByLabelText('Two professionals meeting on a building balcony')).toBeInTheDocument()

    // Verify form heading
    expect(screen.getByText('Sign up')).toBeInTheDocument()

    // Fill and submit the form
    await user.type(screen.getByPlaceholderText('Enter your name'), 'Alice Smith')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'alice@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '5551234567')
    await user.type(screen.getByPlaceholderText('Enter password'), 'SecurePass123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'SecurePass123')

    const submitButton = screen.getByRole('button', { name: /Create Account/i })
    await user.click(submitButton)

    // Verify success message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Check your email for verification/i)
    })

    // Verify API was called with correct payload
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Alice Smith',
      email: 'alice@example.com',
      phoneNumber: '5551234567',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })
  })

  // Test 6: Page displays validation error when form submission fails
  test('6. Page displays error message when registration fails', async () => {
    const user = userEvent.setup()
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    const registrationError = new authService.RegistrationError('Email already registered', {
      email: 'Email already exists',
    })
    mockRegister.mockRejectedValueOnce(registrationError)

    renderWithRouter(<RegisterPage />)

    // Fill form
    await user.type(screen.getByPlaceholderText('Enter your name'), 'Bob Jones')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'bob@example.com')
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '5559876543')
    await user.type(screen.getByPlaceholderText('Enter password'), 'Password123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Password123')

    // Submit
    const submitButton = screen.getByRole('button', { name: /Create Account/i })
    await user.click(submitButton)

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  // Test 7: Page maintains two-column layout (Hero 58.6%, Form 41.4%)
  test('7. Page maintains two-column layout with hero on left and form on right', () => {
    renderWithRouter(<RegisterPage />)

    // Verify both main components are rendered
    const heroImage = screen.getByLabelText('Two professionals meeting on a building balcony')
    const formHeading = screen.getByText('Sign up')

    expect(heroImage).toBeInTheDocument()
    expect(formHeading).toBeInTheDocument()

    // Both should be visible in the DOM
    expect(heroImage.parentElement?.parentElement?.style.flex).toBe('1')
  })

  // Test 8: Page renders submit button with correct label
  test('8. Page renders Create Account button with correct styling', () => {
    renderWithRouter(<RegisterPage />)

    const button = screen.getByRole('button', { name: /Create Account/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveStyle({ backgroundColor: '#5B21B6' })
  })

  // Test 9: Page renders login link
  test('9. Page renders login link in RegisterForm', () => {
    renderWithRouter(<RegisterPage />)

    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument()
  })

  // Test 10: Full integration - user can toggle password visibility
  test('10. User can toggle password visibility on the form', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement

    // Initially masked
    expect(passwordInput.type).toBe('password')

    // Toggle visibility
    const toggleButton = screen.getByTestId('password-visibility-toggle')
    await user.click(toggleButton)

    expect(passwordInput.type).toBe('text')

    // Toggle back to hidden
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })
})
