import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet, CONTRACT_ADDRESS } from './wagmi'
import { useNextRoundId } from './hooks/usePrediction'
import { PriceChart } from './components/PriceChart'

const queryClient = new QueryClient()

function AppContent() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected, address } = useAccount()
  const { data: nextId, isError } = useNextRoundId()

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#3b82f6' }}>ArcPredict</h1>
          <code style={{ fontSize: '12px', color: '#64748b' }}>Contract: {CONTRACT_ADDRESS}</code>
        </div>
        <div style={{ background: '#1e293b', padding: '10px 15px', borderRadius: '8px' }}>
          {isConnected ? `Connected: ${address?.slice(0,6)}...` : 'Please Connect Wallet'}
        </div>
      </header>

      <main style={{ marginTop: '30px' }}>
        <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #1e293b' }}>
          <PriceChart asset="BTC" />
        </div>

        <div style={{ marginTop: '20px', padding: '15px', background: '#1e293b', borderRadius: '8px' }}>
          <h3>Network Status</h3>
          <p>Next Round ID: {nextId?.toString() || (isError ? 'Error loading data' : 'Connecting to Arc Testnet...')}</p>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
