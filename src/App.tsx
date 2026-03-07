import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, CONTRACT_ADDRESS } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'
import { PriceChart } from './components/PriceChart'

const queryClient = new QueryClient()

function MainApp() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')

  // Logic tính toán an toàn
  const totalRounds = nextId && Number(nextId) > 0 ? Number(nextId) - 1 : 0

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif' }}>
      <nav style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#3b82f6', margin: 0 }}>◈ ArcPredict</h2>
        {isConnected ? (
          <button onClick={() => disconnect()} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            {address?.slice(0,6)}... Logout
          </button>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Connect Wallet
          </button>
        )}
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#111827', borderRadius: '16px', padding: '20px', border: '1px solid #1e293b', marginBottom: '30px' }}>
          <PriceChart asset={asset} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px' }}>
            <h3>New Prediction</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setAsset('BTC')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: asset === 'BTC' ? '#3b82f6' : 'transparent', color: 'white' }}>BTC</button>
              <button onClick={() => setAsset('ETH')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: asset === 'ETH' ? '#3b82f6' : 'transparent', color: 'white' }}>ETH</button>
            </div>
            <button 
              disabled={isStarting || !isConnected} 
              onClick={() => startRound(asset)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', opacity: isConnected ? 1 : 0.5 }}
            >
              {isStarting ? 'Processing...' : `Start ${asset} Round`}
            </button>
          </div>

          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px' }}>
            <h3>Stats</h3>
            <p>Next ID: {nextId?.toString() || '0'}</p>
            <p>Total Rounds: {totalRounds}</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Contract: {CONTRACT_ADDRESS}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
