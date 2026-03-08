import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config } from './wagmi'
import QuizPage from './components/QuizPage'
import DashboardPage from './components/DashboardPage'
import './components/dashboard.css'

const queryClient = new QueryClient()

function AppInner() {
  const [page, setPage] = useState<'dashboard' | 'quiz'>('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#3b82f6' }}>◈ ArcPredict</span>
          <button
            onClick={() => setPage('dashboard')}
            style={{
              background: 'none', border: 'none',
              color: page === 'dashboard' ? '#3b82f6' : '#64748b',
              cursor: 'pointer', fontWeight: 700, fontSize: '14px'
            }}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => setPage('quiz')}
            style={{
              background: 'none', border: 'none',
              color: page === 'quiz' ? '#3b82f6' : '#64748b',
              cursor: 'pointer', fontWeight: 700, fontSize: '14px'
            }}
          >
            🧠 Quiz
          </button>
        </div>
        <ConnectKitButton />
      </nav>

      {/* Pages */}
      {page === 'dashboard' && <DashboardPage />}
      {page === 'quiz' && <QuizPage />}
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="midnight">
          <AppInner />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
