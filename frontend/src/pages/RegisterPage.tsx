import React from 'react'
import HeroImage from '../components/HeroImage'
import RegisterForm from '../components/RegisterForm'
import Logo from '../components/Logo'

const RegisterPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left Panel — Hero Image */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <HeroImage alt="Two professionals meeting on a building balcony" />
      </div>

      {/* Right Panel — White Card with Registration Form */}
      <div
        style={{
          width: '596px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '56px',
          borderBottomLeftRadius: '56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          zIndex: 1,
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        {/* Logo row — left-aligned with consistent indent */}
        <div style={{ flexShrink: 0, padding: 'clamp(40px, 11.6vh, 103px) 0 0 142px' }}>
          <Logo />
        </div>

        {/* Main content — fills remaining height, centres the stack vertically */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            padding: '16px 40px',
          }}
        >
          {/* Register heading + subtitle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.208px',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '33px',
                color: '#5B21B6',
                lineHeight: '41.6px',
                margin: 0,
                letterSpacing: '0.208px',
              }}
            >
              Sign up
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '20px',
                color: '#474A5F',
                lineHeight: '25.2px',
                margin: 0,
              }}
            >
              Create an account to get started
            </p>
          </div>

          {/* Registration Form */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <RegisterForm />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: '32px 40px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: '#292D32',
              lineHeight: '17.64px',
              margin: 0,
            }}
          >
            Copyright 2026 Changepond. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
