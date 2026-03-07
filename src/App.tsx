import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import {
  useRound, useNextRoundId, useUserBet, useUsdcBalance, useUsdcAllowance,
  useApproveUsdc, usePlaceBet, useClaim, useStartRound, useResolveRound,
  formatUsdc, formatPrice, getRoundStatusLabel, timeLeft,
  type Round, type Position
} from './hooks/usePrediction'
import { parseUnits } from 'viem'
import { PriceChart } from './components/PriceChart'
import { ResultModal } from './components/ResultModal'

const queryClient = new QueryClient()

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useUsdcBalance()

  if (!isConnected) return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {connectors.map(c => (
        <button key={c.id} className="btn-connect" onClick={() => connect({ connector: c })}>
          {c.name}
        </button>
      ))}
    </div>
  )

  const wrongChain = chainId !== arcTestnet.id
  return (
    <div className="wallet-info">
      {wrongChain ? (
        <button className="btn-switch-chain" onClick={() => switchChain({ chainId: arcTestnet.id })}>
          ⚠ Switch to Arc
        </button>
      ) : (
        <div className="wallet-details">
          {balance !== undefined && <span className="balance">{formatUsdc(balance as bigint)} USDC</span>}
          <span className="address">{address?.slice(0,6)}…{address?.slice(-4)}</span>
        </div>
      )}
      <button className="btn-disconnect" onClick={() => disconnect()}>Logout</button>
    </div>
  )
}

function AppInner() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const totalRounds = nextId ? Number(nextId) - 1 : 0
  
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark">◈</div>
          <div className="brand-name">ArcPredict</div>
        </div>
        <WalletButton />
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div className="start-section" style={{ textAlign: 'center', background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b' }}>
          <h2 style={{ color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase' }}>Current Market</h2>
          <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {['BTC', 'ETH'].map((t) => (
              <button 
                key={t}
                onClick={() => setAsset(t as 'BTC'|'ETH')} 
                style={{ padding: '10px 20px', borderRadius: '12px', border: asset === t ? '2px solid #3b82f6' : '1px solid #334155', background: asset === t ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: asset === t ? '#3b82f6' : '#64748b', cursor: 'pointer' }}
              >
                {t}
              </button>
            ))}
          </div>

          <button 
            disabled={isStarting || !isConnected}
            onClick={() => startRound(asset)}
            style={{ width: '100%', maxWidth: '300px', padding: '18px', borderRadius: '16px', background: isConnected ? '#10b981' : '#334155', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: isConnected ? 'pointer' : 'not-allowed' }}
          >
            {isStarting ? 'Processing...' : isConnected ? `▶ Start ${asset} Prediction` : 'Connect Wallet to Start'}
          </button>
          
          <p style={{ marginTop: '20px', color: '#64748b' }}>Next Round ID: #{nextId?.toString() || '1'}</p>
        </div>
      </main>
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
