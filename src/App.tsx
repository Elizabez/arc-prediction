import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import {
  useRound, useNextRoundId, useUsdcBalance,
  timeLeft,
} from './hooks/usePrediction'
import { PriceChart } from './components/PriceChart'

const queryClient = new QueryClient()

function AppInner() {
  // Fix lỗi Hydration (Màn hình đen lúc khởi tạo)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const [chartAsset, setChartAsset] = useState<'BTC'|'ETH'>('BTC')

  // Logic tính toán Round an toàn để tránh crash
  const totalRounds = nextId && Number(nextId) > 0 ? Number(nextId) - 1 : 0
  const roundIds = totalRounds > 0 
    ? Array.from({ length: Math.min(9, totalRounds) }, (_, i) => BigInt(totalRounds - i))
    : []

  if (!mounted) return null

  return (
    <div className="app" style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '20px' }}>
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div className="brand">
          <h1 style={{ margin: 0, color: '#60a5fa' }}>ArcPredict</h1>
          <small>on Arc Testnet</small>
        </div>
        <div className="wallet-status">
           {isConnected ? "✅ Wallet Connected" : "❌ Not Connected"}
        </div>
      </nav>

      <div className="chart-section" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0 }}>Market Chart</h2>
        <PriceChart asset={chartAsset} />
      </div>

      <div className="rounds-status">
        <h3>System Status</h3>
        <p>Total Rounds found: {totalRounds}</p>
        <p>Contract: {import.meta.env.VITE_CONTRACT_ADDRESS || "Warning: Env VITE_CONTRACT_ADDRESS is missing!"}</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
