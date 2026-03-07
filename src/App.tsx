import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function MainContent() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const handleStart = async () => {
    // Nếu sai mạng, ép chuyển mạng trước
    if (chainId !== arcTestnet.id) {
      switchChain({ chainId: arcTestnet.id })
      return
    }
    startRound(asset)
  }

  return (
    <main style={{ maxWidth: '600px', margin: '60px auto', padding: '20px', textAlign: 'center' }}>
      <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b' }}>
        <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>ArcPredict Market</h2>
        <p style={{ color: '#64748b' }}>Next Round ID: #{nextId?.toString() || '1'}</p>
        
        <div style={{ margin: '30px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {['BTC', 'ETH'].map(t => (
            <button key={t} onClick={() => setAsset(t as any)} style={{ padding: '10px 25px', borderRadius: '12px', border: asset === t ? '2px solid #3b82f6' : '1px solid #334155', background: 'transparent', color: 'white', cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>

        <button 
          disabled={!isConnected || isPending}
          onClick={handleStart}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', background: isConnected ? '#10b981' : '#334155', color: 'white', border: 'none', fontWeight: 'bold', cursor: isConnected ? 'pointer' : 'not-allowed' }}
        >
          {chainId !== arcTestnet.id ? 'Switch to Arc Network' : (isPending ? 'Confirming...' : `Start ${asset} Round`)}
        </button>
      </div>
    </main>
  )
}

export default function App() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white' }}>
          <MainContent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
