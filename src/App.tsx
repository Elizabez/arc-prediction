import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import { useNextRoundId, useStartRound, formatUsdc } from './hooks/usePrediction'

const queryClient = new QueryClient()

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected) return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {connectors.map(c => (
        <button key={c.id} onClick={() => connect({ connector: c })} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Connect {c.name}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {chainId !== arcTestnet.id && (
        <button onClick={() => switchChain({ chainId: arcTestnet.id })} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
          Switch to Arc
        </button>
      )}
      <span style={{ color: '#94a3b8' }}>{address?.slice(0,6)}...{address?.slice(-4)}</span>
      <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>Logout</button>
    </div>
  )
}

function MainContent() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')

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
          onClick={() => startRound(asset)}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', background: isConnected ? '#10b981' : '#334155', color: 'white', border: 'none', fontWeight: 'bold', cursor: isConnected ? 'pointer' : 'not-allowed' }}
        >
          {isPending ? 'Confirming in Wallet...' : `Start ${asset} Round`}
        </button>
        {!isConnected && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>Please connect wallet first</p>}
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
          <nav style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ margin: 0 }}>◈ ArcPredict</h3>
            <WalletButton />
          </nav>
          <MainContent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
