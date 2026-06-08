type Role = 'Admin' | 'Receptionist' | 'Security Guard'

type LoginRoleTabsProps = {
  activeRole: Role
  onChange: (role: Role) => void
}

const roles: Role[] = ['Admin', 'Receptionist', 'Security Guard']

function LoginRoleTabs({ activeRole, onChange }: LoginRoleTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Select user role"
      style={{
        backgroundColor: 'var(--color-tab-bg)',
        borderRadius: 'var(--radius-pill)',
        width: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0',
      }}
    >
      {roles.map((role) => {
        const isActive = activeRole === role
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="login-form-panel"
            id={`role-tab-${role.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onChange(role)}
            style={{
              border: 'none',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? '#ffffff' : '#3c3c3c',
              borderRadius: '25px',
              padding: '10px 18px',
              minWidth: role === 'Security Guard' ? '152px' : 'auto',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: isActive ? 600 : 400,
              lineHeight: 'normal',
              cursor: 'pointer',
            }}
          >
            {role}
          </button>
        )
      })}
    </div>
  )
}

export type { Role }
export default LoginRoleTabs
