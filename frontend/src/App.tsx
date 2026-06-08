import { Component, ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#C62828', fontFamily: 'Inter, sans-serif' }}>
          Something went wrong while rendering this page.
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = localStorage.getItem('accessToken')
  return accessToken ? <>{children}</> : <Navigate to="/" replace />
}

function DashboardPlaceholder() {
  return (
    <div style={{ padding: '32px', fontFamily: 'Inter, sans-serif' }}>
      Dashboard route placeholder.
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
