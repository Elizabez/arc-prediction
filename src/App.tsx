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
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()

  // 1. Lấy giá realtime từ Binance API
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
    const interval = setInterval(fetchPrice, 3000) // Cập nhật mỗi 3 giây
    return () => clearInterval(interval)
  }, [asset])

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#3b82f6' }}>◈ ArcPredict</h1>
        {isConnected ? (
          <button onClick={() => disconnect()} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
            {address?.slice(0,6)}... Logout
          </button>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
            Connect Wallet
          </button>
        )}
      </header>

      <main style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
        <div style={{ background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => setAsset('BTC')} style={{ marginRight: '10px', padding: '8px 20px', borderRadius: '20px', border: asset === 'BTC' ? '1px solid #3b82f6' : '1px solid #334155', background: asset === 'BTC' ? '#3b82f6' : 'transparent', color: 'white' }}>BTC</button>
            <button onClick={() => setAsset('ETH')} style={{ padding: '8px 20px', borderRadius: '20px', border: asset === 'ETH' ? '1px solid #3b82f6' : '1px solid #334155', background: asset === 'ETH' ? '#3b82f6' : 'transparent', color: 'white' }}>ETH</button>
          </div>
          
          <h2 style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Current {asset} Price</h2>
          <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0', color: '#f8fafc' }}>
            ${realtimePrice}
          </div>

          <div style={{ margin: '30px 0', padding: '20px', background: '#1e293b', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>Next Round ID: <span style={{ color: '#3b82f6' }}>{nextId?.toString() || '1'}</span></p>
          </div>

          <button 
            disabled={isStarting || !isConnected}
            onClick={() => startRound(asset)}
            style={{ width: '100%', padding: '18px', borderRadius: '14px', background: '#10b981', color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
          >
            {isStarting ? 'Confirming...' : `▶ Start ${asset} Round`}
          </button>
          {!isConnected && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px' }}>Vui lòng kết nối ví để bắt đầu</p>}
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
