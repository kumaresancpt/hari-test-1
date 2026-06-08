import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginRoleTabs, { Role } from '../components/LoginRoleTabs'
import { forgotPasswordRequest, loginRequest, resetPasswordRequest } from '../services/auth'

const heroImage =
  'https://www.figma.com/api/mcp/asset/0b83aaa5-0df4-4104-a5f5-f6d182c7653c'
const logoMark =
  'https://www.figma.com/api/mcp/asset/d15b5584-accf-49b5-9cde-67967a7e2017'
const cptLogo =
  'https://www.figma.com/api/mcp/asset/91ab743e-f4b3-4e3e-a820-8e88c1f3e906'

type AuthView = 'login' | 'forgot-password' | 'reset-password'

function formatOtpExpiry(otpExpiresAt: string | null) {
  if (!otpExpiresAt) {
    return null
  }

  const parsedDate = new Date(otpExpiresAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toLocaleString()
}

function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('Admin')
  const [view, setView] = useState<AuthView>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [otpExpiryLabel, setOtpExpiryLabel] = useState<string | null>(null)

  const panelTitle = useMemo(() => {
    if (view === 'forgot-password') {
      return 'Forgot Password'
    }

    if (view === 'reset-password') {
      return 'Reset Password'
    }

    return 'Login'
  }, [view])

  const panelSubtitle = useMemo(() => {
    if (view === 'forgot-password') {
      return 'Enter your email to receive a one-time password.'
    }

    if (view === 'reset-password') {
      return 'Use the OTP from your email and set a new password.'
    }

    return 'Welcome to Visitor'
  }, [view])

  function resetMessages() {
    setApiError(null)
    setSuccessMessage(null)
  }

  function switchView(nextView: AuthView) {
    resetMessages()
    setView(nextView)
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const data = await loginRequest({
        username,
        password,
      })

      if (data.token) {
        localStorage.setItem('accessToken', data.token)
      }

      setSuccessMessage(`Login succeeded for ${data.role}. Redirecting...`)
      navigate(data.redirectUrl || '/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected login error.'
      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const data = await forgotPasswordRequest({
        email,
      })

      setSuccessMessage(data.message)
      setOtpExpiryLabel(formatOtpExpiry(data.otpExpiresAt))
      setView('reset-password')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected forgot password error.'
      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const data = await resetPasswordRequest({
        email,
        otp,
        newPassword,
        confirmPassword,
      })

      setSuccessMessage(data.message)
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setView('login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected reset password error.'
      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#ffffff',
      }}
    >
      <section
        aria-hidden="true"
        style={{
          flex: '0 0 58.61%',
          minHeight: '885px',
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      <section
        aria-labelledby="login-heading"
        style={{
          flex: '0 0 41.39%',
          minHeight: '885px',
          backgroundColor: 'var(--color-panel-bg)',
          borderTopLeftRadius: 'var(--radius-panel)',
          borderBottomLeftRadius: 'var(--radius-panel)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '103px 40px 24px',
        }}
      >
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: '313px', height: '73px', position: 'relative' }}>
            <img src={logoMark} alt="Visitor logo icon" style={{ position: 'absolute', width: '56px', height: '66px', top: '3px', left: 0 }} />
            <p
              style={{
                margin: 0,
                position: 'absolute',
                top: '9px',
                left: '66px',
                fontFamily: 'Satoshi, Inter, sans-serif',
                fontSize: '31px',
                fontWeight: 900,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
              }}
            >
              Visitor
            </p>
            <p
              style={{
                margin: 0,
                position: 'absolute',
                top: '48px',
                left: '66px',
                fontFamily: 'Satoshi, Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: '#000000',
              }}
            >
              Powered by
            </p>
            <img src={cptLogo} alt="Changepond logo" style={{ position: 'absolute', width: '175px', height: '18px', top: '48px', left: '133px' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1
              id="login-heading"
              style={{
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: '33px',
                fontWeight: 600,
                lineHeight: '41.6px',
                color: 'var(--color-primary)',
              }}
            >
              {panelTitle}
            </h1>
            <p
              style={{
                margin: '5px 0 0',
                fontFamily: 'Inter, sans-serif',
                fontSize: '20px',
                fontWeight: 400,
                color: 'var(--color-muted)',
              }}
            >
              {panelSubtitle}
            </p>
          </div>

          {view === 'login' ? <LoginRoleTabs activeRole={role} onChange={setRole} /> : null}

          <form
            id="login-form-panel"
            role="tabpanel"
            aria-labelledby={`role-tab-${role.replace(/\s+/g, '-').toLowerCase()}`}
            onSubmit={
              view === 'login'
                ? handleLoginSubmit
                : view === 'forgot-password'
                  ? handleForgotPasswordSubmit
                  : handleResetPasswordSubmit
            }
            style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            {apiError ? (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 12px', fontSize: '14px' }}>{apiError}</div>
            ) : null}
            {successMessage ? (
              <div style={{ backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '8px', padding: '10px 12px', fontSize: '14px' }}>{successMessage}</div>
            ) : null}
            {otpExpiryLabel && view === 'reset-password' ? (
              <div style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: '8px', padding: '10px 12px', fontSize: '14px' }}>
                OTP expires at {otpExpiryLabel}.
              </div>
            ) : null}

            {view === 'login' ? (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>Username</span>
                  <span
                    style={{
                      height: '48px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      gap: '8px',
                    }}
                  >
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="ex., john@123"
                      style={{
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '14px',
                        color: '#292D32',
                      }}
                    />
                    <span aria-hidden="true" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>
                      ◌
                    </span>
                  </span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>Password</span>
                  <span
                    style={{
                      height: '48px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      gap: '8px',
                    }}
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Please Enter"
                      style={{
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '14px',
                        color: '#292D32',
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((previous) => !previous)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)' }}
                    >
                      ◉
                    </button>
                  </span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-18px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#3b3b3b' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Keep me logged In
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '14px', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            ) : null}

            {view !== 'login' ? (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>Email</span>
                <span
                  style={{
                    height: '48px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-field-border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#292D32' }}
                  />
                </span>
              </label>
            ) : null}

            {view === 'reset-password' ? (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>OTP</span>
                  <span
                    style={{
                      height: '48px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                    }}
                  >
                    <input
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#292D32' }}
                    />
                  </span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>New Password</span>
                  <span
                    style={{
                      height: '48px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      gap: '8px',
                    }}
                  >
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Create a new password"
                      style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#292D32' }}
                    />
                    <button
                      type="button"
                      aria-label={showResetPassword ? 'Hide new password' : 'Show new password'}
                      onClick={() => setShowResetPassword((previous) => !previous)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)' }}
                    >
                      ◉
                    </button>
                  </span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b3b3b', lineHeight: '16px' }}>Confirm Password</span>
                  <span
                    style={{
                      height: '48px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      gap: '8px',
                    }}
                  >
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm your new password"
                      style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#292D32' }}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPassword((previous) => !previous)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)' }}
                    >
                      ◉
                    </button>
                  </span>
                </label>
              </>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '400px',
                height: '48px',
                border: 'none',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {view === 'login'
                ? submitting
                  ? 'Signing In...'
                  : 'Login'
                : view === 'forgot-password'
                  ? submitting
                    ? 'Sending OTP...'
                    : 'Send OTP'
                  : submitting
                    ? 'Resetting Password...'
                    : 'Reset Password'}
            </button>

            {view !== 'login' ? (
              <button
                type="button"
                onClick={() => switchView('login')}
                style={{
                  width: '400px',
                  height: '48px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-primary)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back to Login
              </button>
            ) : null}

            {view === 'forgot-password' ? (
              <button
                type="button"
                onClick={() => switchView('reset-password')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginTop: '-18px',
                }}
              >
                Already have an OTP? Reset password
              </button>
            ) : null}

            <p style={{ margin: 0, textAlign: 'center', width: '400px', color: 'var(--color-secondary-dark)', fontSize: '16px' }}>
              {view === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                    Sign up
                  </a>
                </>
              ) : (
                <>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Return to login
                  </button>
                </>
              )}
            </p>
          </form>
        </div>

        <p style={{ margin: 0, fontSize: '14px', color: '#292d32', textAlign: 'center' }}>
          Copyright 2026 Changepond. All Rights Reserved.
        </p>
      </section>
    </main>
  )
}

export default LoginPage
