import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet, USDC_ADDRESS } from './wagmi'
import { useNextRoundId, useStartRound, useAdminActions } from './hooks/usePrediction'

const queryClient = new QueryClient()

// Thay địa chỉ ví của Vinh vào đây để làm Owner
const OWNER_ADDRESS = '0x3c1851...1431' 

function AdminPanel() {
  const [adminAmount, setAdminAmount] = useState('100')
  const { approveUSDC, depositPool, withdrawPool } = useAdminActions()

  return (
    <div style={{ marginTop: '50px', padding: '30px', background: '#0f172a', borderRadius: '20px', border: '1px dashed #3b82f6' }}>
      <h3 style={{ color: '#3b82f6', fontSize: '14px', marginBottom: '20px' }}>ADMIN CONSOLE (OWNER ONLY)</h3>
      <input 
        type="number" 
        value={adminAmount}
        onChange={(e) => setAdminAmount(e.target.value)}
        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: 'white', marginBottom: '15px' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <button onClick={() => approveUSDC(adminAmount)} style={{ background: '#334155', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>1. Approve</button>
        <button onClick={() => depositPool(adminAmount)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>2. Deposit</button>
        <button onClick={() => withdrawPool(adminAmount)} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>Withdraw</button>
      </div>
    </div>
  )
}

function TradingInterface() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address, token: USDC_ADDRESS })
  const { startRound, isPending } = useStartRound()
  const [amount, setAmount] = useState('10')
  const [leverage, setLeverage] = useState(5)
  const [price, setPrice] = useState(65440.68)

  useEffect(() => {
    const timer = setInterval(() => setPrice(p => p + (Math.random() * 4 - 2)), 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div style={{ background: '#111827', borderRadius: '24px', padding: '30px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', color: '#94a3b8' }}>BTC / USDC</h1>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>${price.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ height: '250px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', borderBottom: '2px solid #10b981' }}></div>
        </div>

        <div style={{ background: '#111827', borderRadius: '24px', padding: '24px', border: '1px solid #1e293b' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#64748b', fontSize: '11px' }}>WALLET BALANCE</label>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{balance?.formatted?.slice(0, 7) || '0.00'} USDC</div>
          </div>
          <button onClick={() => startRound('BTC')} disabled={isPending} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {isPending ? 'Confirming...' : 'Predict UP'}
          </button>
        </div>
      </div>
      
      {/* CHỈ OWNER MỚI THẤY DÒNG NÀY */}
      {isConnected && address?.toLowerCase() === OWNER_ADDRESS.toLowerCase() && (
        <AdminPanel />
      )}
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
          <div style={{ minHeight: '100vh', background: '#020617', color: 'white' }}>
            <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#3b82f6' }}>ArcPredict Pro</div>
              <ConnectKitButton />
            </nav>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <TradingInterface />
            </div>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
