import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function MainApp() {
  const [mounted, setMounted] = useState(false)
  const [realtimePrice, setRealtimePrice] = useState<string>('0.00')
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()

  useEffect(() => {
    setMounted(true)
    const fetchPrice = async () => {
      try {
        const symbol = asset === 'BTC' ? 'BTCUSDT' : 'ETHUSDT'
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        const data = await res.json()
        setRealtimePrice(parseFloat(data.price).toLocaleString('en-US', { minimumFractionDigits: 2 }))
      } catch (err) { console.error(err) }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 3000)
    return () => clearInterval(interval)
  }, [asset])

  if (!mounted) return null

  const isWrongChain = isConnected && chainId !== arcTestnet.id

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#3b82f6' }}>◈ ArcPredict</h1>
        <div>
          {isConnected ? (
            <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
              {address?.slice(0,6)}... Logout
            </button>
          ) : (
            <button onClick={() => connect({ connector: connectors[0] })} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <h2 style={{ fontSize: '14px', color: '#64748b' }}>Current {asset} Price</h2>
          <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '15px 0' }}>${realtimePrice}</div>

          {isWrongChain ? (
            <button 
              onClick={() => switchChain({ chainId: arcTestnet.id })}
              style={{ width: '100%', padding: '20px', borderRadius: '16px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ⚠ Switch to Arc Testnet
            </button>
          ) : (
            <button 
              disabled={isStarting || !isConnected}
              onClick={() => startRound(asset)}
              style={{ width: '100%', padding: '20px', borderRadius: '16px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', opacity: isConnected ? 1 : 0.5 }}
            >
              {isStarting ? 'Confirming...' : isConnected ? `▶ Start ${asset} Round` : 'Please Connect Wallet'}
            </button>
          )}
        </div>
      </main>
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
