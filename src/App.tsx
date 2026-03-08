import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function WalletSection() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected) {
    return (
      <button 
        onClick={() => connect({ connector: connectors[0] })}
        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {chainId !== arcTestnet.id && (
        <button 
          onClick={() => switchChain({ chainId: arcTestnet.id })}
          style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Switch to Arc
        </button>
      )}
      <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{address?.slice(0,6)}...{address?.slice(-4)}</span>
      </div>
      <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
    </div>
  )
}

function PredictionMarket() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const handleStart = async () => {
    if (chainId !== arcTestnet.id) {
      switchChain({ chainId: arcTestnet.id })
      return
    }
    startRound(asset)
  }

  return (
    <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center', width: '100%', maxWidth: '450px' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '5px' }}>ArcPredict</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Next Round ID: #{nextId?.toString() || '1'}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
        {['BTC', 'ETH'].map(t => (
          <button key={t} onClick={() => setAsset(t as any)} style={{ padding: '8px 25px', borderRadius: '10px', border: asset === t ? '2px solid #3b82f6' : '1px solid #334155', background: 'transparent', color: 'white', cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      <button 
        disabled={!isConnected || isPending}
        onClick={handleStart}
        style={{ width: '100%', padding: '15px', borderRadius: '12px', background: isConnected ? '#10b981' : '#334155', color: 'white', border: 'none', fontWeight: 'bold', cursor: isConnected ? 'pointer' : 'not-allowed' }}
      >
        {!isConnected ? 'Connect Wallet Above' : (isPending ? 'Confirming...' : `Start ${asset} Round`)}
      </button>
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
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
          <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ margin: 0, color: '#3b82f6' }}>◈ ArcPredict</h3>
            <WalletSection />
          </header>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
            <PredictionMarket />
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
