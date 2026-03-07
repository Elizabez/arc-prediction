import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function MainApp() {
  const [mounted, setMounted] = useState(false)
  const [realtimePrice, setRealtimePrice] = useState<string>('0.00')
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  
  const { isConnected, address } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
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
      } catch (err) {
        console.error("Lỗi lấy giá:", err)
      }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 3000)
    return () => clearInterval(interval)
  }, [asset])

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '30px' }}>◈</span> ArcPredict
        </h1>
        
        <div className="wallet-area">
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>
                {address?.slice(0,6)}...{address?.slice(-4)}
              </span>
              <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {connectError && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>Lỗi: {connectError.message}</p>}

      <main style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
        <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {['BTC', 'ETH'].map((t) => (
              <button 
                key={t}
                onClick={() => setAsset(t as 'BTC'|'ETH')} 
                style={{ 
                  padding: '10px 25px', borderRadius: '20px', 
                  border: asset === t ? '2px solid #3b82f6' : '1px solid #334155', 
                  background: asset === t ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                  color: asset === t ? '#3b82f6' : '#94a3b8',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          
          <h2 style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Current {asset} Price
          </h2>
          <div style={{ fontSize: '56px', fontWeight: 'bold', margin: '15px 0', color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
            ${realtimePrice}
          </div>

          <div style={{ margin: '30px 0', padding: '20px', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px' }}>
              <span>Network: <strong>Arc Testnet</strong></span>
              <span>Next Round: <strong style={{ color: '#3b82f6' }}>#{nextId?.toString() || '1'}</strong></span>
            </div>
          </div>

          <button 
            disabled={isStarting || !isConnected}
            onClick={() => startRound(asset)}
            style={{ 
              width: '100%', padding: '20px', borderRadius: '16px', 
              background: isConnected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#334155', 
              color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold', 
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: isConnected ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            {isStarting ? 'Waiting for Wallet...' : isConnected ? `▶ Start ${asset} Prediction` : 'Connect Wallet to Play'}
          </button>
          
          {!isConnected && (
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '15px' }}>
              ℹ Bạn cần kết nối ví MetaMask hoặc ví tương thích để thực hiện giao dịch.
            </p>
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
