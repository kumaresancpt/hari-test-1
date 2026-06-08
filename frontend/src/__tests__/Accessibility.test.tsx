import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

jest.mock('../services/auth', () => ({
  loginRequest: jest.fn(),
  forgotPasswordRequest: jest.fn(),
  resetPasswordRequest: jest.fn(),
}))

describe('Accessibility', () => {
  it('renders tablist with three role tabs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tablist', { name: 'Select user role' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks Admin tab selected by default and wires tabpanel to admin tab id', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: 'Admin' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'role-tab-admin')
  })

  it('updates selected tab and tabpanel aria-labelledby when role changes', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('tab', { name: 'Security Guard' }))

    expect(screen.getByRole('tab', { name: 'Security Guard' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'role-tab-security-guard')
  })

  it('exposes username and password fields through accessible labels', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ex., john@123')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Please Enter')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('toggles password control aria-label between show and hide', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
  })
})