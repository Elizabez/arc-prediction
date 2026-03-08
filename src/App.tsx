import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet } from './wagmi'

const queryClient = new QueryClient()

function TradingInterface() {
  const { address, isConnected } = useAccount()
  // Vì USDC là Native Currency nên không cần truyền token address nữa
  const { data: balance, refetch } = useBalance({ 
    address,
    chainId: arcTestnet.id 
  })

  useEffect(() => {
    const interval = setInterval(() => refetch(), 3000)
    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div style={{ background: '#111827', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', width: '350px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold' }}>WALLET BALANCE</span>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>
          {isConnected ? `${balance?.formatted?.slice(0, 9) || '0.00'} USDC` : 'Chưa kết nối ví'}
        </div>
      </div>
      
      <button style={{ 
        width: '100%', padding: '16px', borderRadius: '14px', background: '#3b82f6', 
        color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' 
      }}>
        Predict UP
      </button>
    </div>
  )
}

export default function App() {
  const [m, setM] = useState(false); useEffect(() => setM(true), []); if(!m) return null;
  return (
    <WagmiProvider config={config}><QueryClientProvider client={queryClient}><ConnectKitProvider theme="midnight">
      <div style={{ minHeight: '100vh', background: '#020617', color: 'white' }}>
        <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '20px' }}>ArcPredict Pro</div>
          <ConnectKitButton />
        </nav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}><TradingInterface /></div>
      </div>
    </ConnectKitProvider></QueryClientProvider></WagmiProvider>
  )
}
// Quiz tab added via patch - see QuizPage component
