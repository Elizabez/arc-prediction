import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet, USDC_ADDRESS } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function TradingInterface() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({ address, token: USDC_ADDRESS })
  const { startRound, isPending } = useStartRound()
  
  const [amount, setAmount] = useState('10')
  const [leverage, setLeverage] = useState(5)
  const [price, setPrice] = useState(65432.10)

  // Giả lập chart nhảy đơn giản
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => prev + (Math.random() * 10 - 5))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleBet = () => {
    if (chainId !== arcTestnet.id) {
      switchChain({ chainId: arcTestnet.id })
      return
    }
    startRound('BTC')
  }

  return (
    <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', padding: '20px' }}>
      {/* Cột trái: Chart & Info */}
      <div style={{ background: '#111827', borderRadius: '24px', padding: '30px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>BTC / USDC</h1>
            <span style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold' }}>${price.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#64748b', margin: 0 }}>Time Remaining</p>
            <span style={{ fontSize: '20px', color: '#f59e0b' }}>02:59</span>
          </div>
        </div>
        
        {/* Simple Visual Chart Placeholder */}
        <div style={{ height: '200px', width: '100%', background: 'linear-gradient(transparent, rgba(16, 185, 129, 0.1))', borderBottom: '2px solid #10b981', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
            <div style={{ position: 'absolute', bottom: '20%', left: 0, width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '10px', color: '#10b981' }}>● Live</div>
        </div>
      </div>

      {/* Cột phải: Betting Panel */}
      <div style={{ background: '#111827', borderRadius: '24px', padding: '24px', border: '1px solid #1e293b' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>WALLET BALANCE</label>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{balance?.formatted || '0.00'} {balance?.symbol}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>AMOUNT</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: 'white', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>MARGIN (LEVERAGE)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[2, 5, 10, 20].map(x => (
              <button 
                key={x} 
                onClick={() => setLeverage(x)}
                style={{ padding: '8px', borderRadius: '8px', border: leverage === x ? '1px solid #3b82f6' : '1px solid #334155', background: leverage === x ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: leverage === x ? '#3b82f6' : '#94a3b8', cursor: 'pointer' }}
              >
                x{x}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            disabled={!isConnected || isPending}
            onClick={handleBet}
            style={{ background: '#10b981', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {isPending ? 'Confirming...' : 'Predict UP (Long)'}
          </button>
          <button 
            disabled={!isConnected || isPending}
            onClick={handleBet}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {isPending ? 'Confirming...' : 'Predict DOWN (Short)'}
          </button>
        </div>
      </div>
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
        <ConnectKitProvider theme="midnight">
          <div style={{ minHeight: '100vh', background: '#020617', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
              <h2 style={{ margin: 0, color: '#3b82f6' }}>ArcPredict Pro</h2>
              <ConnectKitButton />
            </nav>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <TradingInterface />
            </div>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
