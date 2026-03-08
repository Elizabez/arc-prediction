import { useState } from 'react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config } from './wagmi'
import QuizPage from './components/QuizPage'

const queryClient = new QueryClient()

function AppInner() {
  const { isConnected } = useAccount()
  const [page, setPage] = useState<'home' | 'quiz'>('home')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#3b82f6' }}>◈ ArcPredict</span>
          <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: page === 'home' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            🏠 Predict
          </button>
          <button onClick={() => setPage('quiz')} style={{ background: 'none', border: 'none', color: page === 'quiz' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            🧠 Quiz
          </button>
        </div>
        <ConnectKitButton />
      </nav>

      {/* Pages */}
      {page === 'quiz' && <QuizPage />}

      {page === 'home' && (
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>
            Predict crypto prices on Arc
          </h1>
          <p style={{ color: '#64748b', marginBottom: '40px' }}>
            Bet USDC on BTC or ETH going UP or DOWN. Win from the losing pool.
          </p>
          {!isConnected && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ConnectKitButton />
            </div>
          )}
          {isConnected && (
            <p style={{ color: '#10b981' }}>✓ Wallet connected — prediction market coming soon!</p>
          )}
        </div>
      )}
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
