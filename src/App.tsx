import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import { useNextRoundId, useStartRound } from './hooks/usePrediction'

const queryClient = new QueryClient()

function MainApp() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isWrongChain = isConnected && chainId !== arcTestnet.id

  const handleConnect = () => {
    connect({ connector: connectors[0] })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', padding: '20px', textAlign: 'center' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
        <h2 style={{ color: '#3b82f6' }}>◈ ArcPredict</h2>
        
        {isConnected ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            {isWrongChain && (
              <button 
                onClick={() => switchChain({ chainId: arcTestnet.id })}
                style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                ⚠ Chuyển sang Arc Network
              </button>
            )}
            <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              {address?.slice(0,6)}... Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConnect} 
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Connect MetaMask
          </button>
        )}
      </nav>

      <div style={{ marginTop: '100px' }}>
        {!isConnected ? (
          <div style={{ padding: '40px', background: '#111827', borderRadius: '20px', display: 'inline-block' }}>
            <h3>Chào Vinh! 👋</h3>
            <p style={{ color: '#94a3b8' }}>Hãy kết nối ví MetaMask để bắt đầu dự đoán.</p>
            <button onClick={handleConnect} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', marginTop: '20px', cursor: 'pointer', fontSize: '16px' }}>
              Bấm để kết nối ví
            </button>
          </div>
        ) : (
          <div style={{ color: '#10b981' }}>
            ✅ Đã kết nối thành công mạng Arc Testnet!
          </div>
        )}
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
