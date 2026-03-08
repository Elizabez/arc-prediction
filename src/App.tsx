import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit'
import { config } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function MainContent() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')

  return (
    <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center', width: '400px' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>ArcPredict</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Next Round: #{nextId?.toString() || '1'}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <ConnectKitButton />
      </div>

      {isConnected && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['BTC', 'ETH'].map(t => (
              <button key={t} onClick={() => setAsset(t as any)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: asset === t ? '2px solid #3b82f6' : '1px solid #334155', background: 'transparent', color: 'white' }}>{t}</button>
            ))}
          </div>
          <button 
            disabled={isPending}
            onClick={() => startRound(asset)}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold' }}
          >
            {isPending ? 'Confirming...' : `Start ${asset} Round`}
          </button>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <MainContent />
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
