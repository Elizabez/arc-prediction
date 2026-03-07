import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'

const queryClient = new QueryClient()

function MainApp() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', padding: '20px', textAlign: 'center' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
        <h2 style={{ color: '#3b82f6' }}>◈ ArcPredict</h2>
        {isConnected && (
          <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            {address?.slice(0,6)}... Logout
          </button>
        )}
      </nav>

      {!isConnected ? (
        <div style={{ padding: '40px', background: '#111827', borderRadius: '20px', display: 'inline-block' }}>
          <h3>Kết nối ví của bạn</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Chọn ví bạn muốn sử dụng:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{ 
                  background: '#3b82f6', color: 'white', border: 'none', 
                  padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontSize: '16px' 
                }}
              >
                Kết nối {connector.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: '#10b981', fontSize: '20px' }}>
          ✅ Đã kết nối: {address}
        </div>
      )}
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
