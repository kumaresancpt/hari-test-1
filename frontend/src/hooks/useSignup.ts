import { useState, useCallback } from 'react'
import axios from 'axios'

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface SignupResponse {
  message: string
  token?: string
  userId?: string
  [key: string]: unknown
}

interface SignupError {
  fieldErrors?: Record<string, string>
  message?: string
  [key: string]: unknown
}

interface UseSignupReturn {
  isLoading: boolean
  error: SignupError | null
  success: boolean
  handleSignup: (data: SignupFormData) => Promise<SignupResponse | null>
}

export const useSignup = (): UseSignupReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<SignupError | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = useCallback(async (data: SignupFormData): Promise<SignupResponse | null> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate fields before calling API
      const fieldErrors: Record<string, string> = {}

      if (!data.name?.trim()) {
        fieldErrors.name = 'Name is required'
      }

      if (!data.email?.trim()) {
        fieldErrors.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          fieldErrors.email = 'Invalid email format'
        }
      }

      if (!data.password) {
        fieldErrors.password = 'Password is required'
      } else if (data.password.length < 8) {
        fieldErrors.password = 'Password must be at least 8 characters'
      }

      if (!data.confirmPassword) {
        fieldErrors.confirmPassword = 'Confirm password is required'
      } else if (data.password !== data.confirmPassword) {
        fieldErrors.confirmPassword = 'Passwords do not match'
      }

      if (Object.keys(fieldErrors).length > 0) {
        setError({ fieldErrors })
        setIsLoading(false)
        return null
      }

      // Call API
      const response = await axios.post<SignupResponse>('/api/v1/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      if (response.status === 201 || response.status === 200) {
        setSuccess(true)
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
        }
        setIsLoading(false)
        return response.data
      }

      throw new Error('Unexpected response status')
    } catch (err) {
      setIsLoading(false)

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          // Handle 400 error with field-level errors
          const errorData = err.response.data as any
          setError({
            fieldErrors: errorData.fieldErrors || { general: errorData.detail || 'Validation failed' },
            message: errorData.message || errorData.detail || 'Registration failed',
          })
        } else if (err.response?.data) {
          const errorData = err.response.data as any
          setError({
            message: errorData.detail || errorData.message || 'Registration failed. Please try again.',
          })
        } else {
          setError({ message: err.message || 'Network error. Please try again.' })
        }
      } else if (err instanceof Error) {
        setError({ message: err.message })
      } else {
        setError({ message: 'An unexpected error occurred' })
      }

      return null
    }
  }, [])

  return { isLoading, error, success, handleSignup }
}
