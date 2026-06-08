type ApiErrorResponse = {
  detail?: string
}

type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  role: string
  expiresAt: string
  redirectUrl: string
}

type ForgotPasswordRequest = {
  email: string
}

export type ForgotPasswordResponse = {
  message: string
  otpExpiresAt: string | null
}

type ResetPasswordRequest = {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export type ResetPasswordResponse = {
  message: string
}

async function readJson<T>(response: Response): Promise<T | null> {
  const rawBody = await response.text()

  if (!rawBody) {
    return null
  }

  return JSON.parse(rawBody) as T
}

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  const errorBody = await readJson<ApiErrorResponse>(response)
  return new Error(errorBody?.detail ?? fallbackMessage)
}

export async function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await parseError(response, 'Login failed. Please verify your credentials.')
  }

  const data = await readJson<LoginResponse>(response)

  if (!data) {
    throw new Error('Login response was empty.')
  }

  return data
}

export async function forgotPasswordRequest(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await parseError(response, 'Unable to start password reset.')
  }

  const data = await readJson<ForgotPasswordResponse>(response)

  if (!data) {
    throw new Error('Forgot password response was empty.')
  }

  return data
}

export async function resetPasswordRequest(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await parseError(response, 'Unable to reset password.')
  }

  const data = await readJson<ResetPasswordResponse>(response)

  if (!data) {
    throw new Error('Reset password response was empty.')
  }

  return data
}
