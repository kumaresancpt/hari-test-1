// Registration request payload
export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
}

// Registration response payload
export interface RegisterResponse {
  success?: boolean
  message?: string
  detail?: string
  userId?: string
  token?: string
  [key: string]: unknown
}

// API Error response with field-level errors
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string>
  detail?: string
}

// Custom error class to preserve field-level errors
export class RegistrationError extends Error {
  constructor(
    message: string,
    public errors?: Record<string, string>,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'RegistrationError'
  }
}

// Register a new user
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const responseData = (await response.json()) as RegisterResponse | ApiErrorResponse

    if (!response.ok) {
      // Check if response has field-level errors (backend validation errors)
      const apiError = responseData as ApiErrorResponse
      if (apiError.errors && Object.keys(apiError.errors).length > 0) {
        throw new RegistrationError(
          apiError.message || 'Registration failed. Please check your input.',
          apiError.errors,
          response.status
        )
      }
      // Fallback to generic error message
      throw new RegistrationError(
        apiError.message || apiError.detail || 'Registration failed. Please try again.',
        undefined,
        response.status
      )
    }

    return responseData as RegisterResponse
  } catch (error) {
    if (error instanceof RegistrationError) {
      throw error
    }
    if (error instanceof Error) {
      throw new RegistrationError(error.message)
    }
    throw new RegistrationError('Network error. Please try again.')
  }
}
