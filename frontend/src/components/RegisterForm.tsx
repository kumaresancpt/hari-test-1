import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, RegistrationError } from '../api/authService'

// Icons
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M2 6L12 13L22 6" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const EyeOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#8390A2" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="#8390A2" strokeWidth="1.5" />
  </svg>
)

const EyeClosedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 1l22 22" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// Styles
const inputContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '400px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  border: '1px solid #B9B9B9',
  borderRadius: '8px',
  paddingLeft: '16px',
  paddingRight: '48px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  color: '#3B3B3B',
  backgroundColor: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background-color 0.2s',
}

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#DC2626',
  backgroundColor: '#FEF2F2',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  color: '#3B3B3B',
  marginBottom: '6px',
  display: 'block',
}

const errorTextStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '12px',
  color: '#DC2626',
  marginTop: '4px',
  marginLeft: '0px',
}

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

const buttonStyle: React.CSSProperties = {
  width: '400px',
  height: '48px',
  backgroundColor: '#5B21B6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '24px',
  transition: 'background-color 0.2s, opacity 0.2s',
}

const successMessageStyle: React.CSSProperties = {
  width: '400px',
  padding: '12px 16px',
  backgroundColor: '#DCFCE7',
  border: '1px solid #86EFAC',
  borderRadius: '8px',
  color: '#166534',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  marginBottom: '16px',
  textAlign: 'center',
}

const errorMessageStyle: React.CSSProperties = {
  width: '400px',
  padding: '12px 16px',
  backgroundColor: '#FEE2E2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  color: '#991B1B',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  marginBottom: '16px',
  textAlign: 'center',
}

const loginLinkStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  color: '#5B21B6',
  textDecoration: 'none',
  cursor: 'pointer',
  marginTop: '16px',
}

interface RegisterFormState {
  name: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  showPassword: boolean
  showConfirmPassword: boolean
  isLoading: boolean
  error: string | null
  successMessage: string | null
  fieldErrors: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    phoneNumber?: string
  }
}

interface UpdatedRegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const [state, setState] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: null,
    successMessage: null,
    fieldErrors: {},
  })

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: typeof state.fieldErrors = {}

    if (!state.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!state.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(state.email)) {
      errors.email = 'Invalid email format'
    }

    if (!state.password) {
      errors.password = 'Password is required'
    } else if (state.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!state.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (state.password !== state.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!state.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }

    setState((prev) => ({ ...prev, fieldErrors: errors }))
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((prev) => ({ ...prev, error: null, successMessage: null }))

    // Validate form before API call
    if (!validateForm()) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const payload: UpdatedRegisterRequest = {
        name: state.name,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        phoneNumber: state.phoneNumber,
      }

      const response = await register(payload)

      // Success
      setState((prev) => ({
        ...prev,
        isLoading: false,
        successMessage: response.message || 'Registration successful! Check your email for verification.',
      }))

      // Store token if provided
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (error: unknown) {
      // Handle API error with field-level errors
      let errorMessage = 'Registration failed. Please try again.'
      let fieldErrors: typeof state.fieldErrors = {}

      // Extract message from error object
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as Record<string, unknown>
        if (typeof err.message === 'string') {
          errorMessage = err.message
        }
      }

      // Extract field-level errors - works with RegistrationError and other error types
      if (typeof error === 'object' && error !== null && 'errors' in error) {
        const err = error as Record<string, unknown>
        if (err.errors && typeof err.errors === 'object') {
          fieldErrors = err.errors as typeof state.fieldErrors
        }
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : prev.fieldErrors,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setState((prev) => ({
      ...prev,
      [name]: value,
      fieldErrors: {
        ...prev.fieldErrors,
        [name]: undefined,
      },
    }))
  }

  const handleLoginLinkClick = () => {
    navigate('/login', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Success Message */}
      {state.successMessage && (
        <div style={successMessageStyle} role="alert">
          {state.successMessage}
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div style={errorMessageStyle} role="alert">
          {state.error}
        </div>
      )}

      {/* Name Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="name" style={labelStyle}>
          Name
        </label>
        <div style={inputContainerStyle}>
          <input
            id="name"
            name="name"
            type="text"
            value={state.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            style={state.fieldErrors.name ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.name}
            aria-describedby={state.fieldErrors.name ? 'name-error' : undefined}
            data-testid="name-input"
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <UserIcon />
          </div>
        </div>
        {state.fieldErrors.name && (
          <div id="name-error" style={errorTextStyle}>
            {state.fieldErrors.name}
          </div>
        )}
      </div>

      {/* Email Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <div style={inputContainerStyle}>
          <input
            id="email"
            name="email"
            type="email"
            value={state.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            style={state.fieldErrors.email ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.email}
            aria-describedby={state.fieldErrors.email ? 'email-error' : undefined}
            data-testid="email-input"
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <EmailIcon />
          </div>
        </div>
        {state.fieldErrors.email && (
          <div id="email-error" style={errorTextStyle}>
            {state.fieldErrors.email}
          </div>
        )}
      </div>

      {/* Phone Number Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="phoneNumber" style={labelStyle}>
          Phone Number
        </label>
        <div style={inputContainerStyle}>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={state.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            style={state.fieldErrors.phoneNumber ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.phoneNumber}
            aria-describedby={state.fieldErrors.phoneNumber ? 'phone-error' : undefined}
            data-testid="phone-input"
          />
        </div>
        {state.fieldErrors.phoneNumber && (
          <div id="phone-error" style={errorTextStyle}>
            {state.fieldErrors.phoneNumber}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="password" style={labelStyle}>
          Password
        </label>
        <div style={inputContainerStyle}>
          <input
            id="password"
            name="password"
            type={state.showPassword ? 'text' : 'password'}
            value={state.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            style={state.fieldErrors.password ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.password}
            aria-describedby={state.fieldErrors.password ? 'password-error' : undefined}
            data-testid="password-input"
          />
          <button
            type="button"
            style={iconStyle}
            onClick={() => setState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
            disabled={state.isLoading}
            aria-label={state.showPassword ? 'Hide password' : 'Show password'}
            data-testid="password-visibility-toggle"
          >
            {state.showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        {state.fieldErrors.password && (
          <div id="password-error" style={errorTextStyle}>
            {state.fieldErrors.password}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          Confirm Password
        </label>
        <div style={inputContainerStyle}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={state.showConfirmPassword ? 'text' : 'password'}
            value={state.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm password"
            style={state.fieldErrors.confirmPassword ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.confirmPassword}
            aria-describedby={state.fieldErrors.confirmPassword ? 'confirm-error' : undefined}
            data-testid="confirm-password-input"
          />
          <button
            type="button"
            style={iconStyle}
            onClick={() => setState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
            disabled={state.isLoading}
            aria-label={state.showConfirmPassword ? 'Hide password' : 'Show password'}
            data-testid="confirm-password-visibility-toggle"
          >
            {state.showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        {state.fieldErrors.confirmPassword && (
          <div id="confirm-error" style={errorTextStyle}>
            {state.fieldErrors.confirmPassword}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          ...buttonStyle,
          opacity: state.isLoading ? 0.6 : 1,
          cursor: state.isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: state.isLoading ? '#5B21B6' : '#5B21B6',
        }}
        disabled={state.isLoading}
        data-testid="submit-button"
      >
        {state.isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Login Link */}
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#747474' }}>
          Already have an account?{' '}
        </span>
        <button
          type="button"
          onClick={handleLoginLinkClick}
          style={{
            ...loginLinkStyle,
            border: 'none',
            background: 'none',
            padding: 0,
          }}
          data-testid="login-link"
        >
          Log in
        </button>
      </div>
    </form>
  )
}

export default RegisterForm
