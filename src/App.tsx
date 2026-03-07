import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, CONTRACT_ADDRESS } from './wagmi'
import { useNextRoundId } from './hooks/usePrediction'

const queryClient = new QueryClient()

function DebugDashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected, address } = useAccount()
  const { data: nextId, isError, error } = useNextRoundId()

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#3b82f6' }}>◈ ArcPredict Debug Mode</h1>
      
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
        <p><strong>Wallet:</strong> {isConnected ? `✅ ${address}` : '❌ Not Connected'}</p>
        <p><strong>Contract:</strong> <code>{CONTRACT_ADDRESS}</code></p>
        <p><strong>Next Round ID:</strong> {nextId !== undefined ? nextId.toString() : 'Loading...'}</p>
        {isError && <p style={{ color: '#ef4444' }}><strong>Error:</strong> {error?.message}</p>}
      </div>

      <div style={{ marginTop: '30px', color: '#94a3b8' }}>
        <p>Nếu bạn thấy được bảng này, nghĩa là hệ thống lõi đã chạy.</p>
        <p>Lỗi nằm ở các file Component (PriceChart hoặc ResultModal).</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DebugDashboard />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
