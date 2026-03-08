import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, USDC_ADDRESS } from './wagmi'
import { useStartRound, useAdminActions } from './hooks/usePrediction'

const queryClient = new QueryClient()

function AdminPanel() {
  const [adminAmount, setAdminAmount] = useState('10')
  const { approveUSDC, depositPool, withdrawPool, isPending } = useAdminActions()
  return (
    <div style={{ marginTop: '40px', padding: '25px', background: '#0f172a', borderRadius: '15px', border: '1px dashed #3b82f6' }}>
      <h3 style={{ color: '#3b82f6', fontSize: '12px', marginBottom: '15px' }}>ADMIN CONSOLE</h3>
      <input type="number" value={adminAmount} onChange={e => setAdminAmount(e.target.value)} style={{ width: '100%', background: '#1e293b', border: 'none', padding: '12px', borderRadius: '10px', color: 'white', marginBottom: '15px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <button onClick={() => approveUSDC(adminAmount)} style={{ background: '#334155', color: 'white', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>1. Approve</button>
        <button onClick={() => depositPool(adminAmount)} disabled={isPending} style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>{isPending ? 'Processing...' : '2. Deposit'}</button>
        <button onClick={() => withdrawPool(adminAmount)} style={{ background: '#991b1b', color: 'white', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>Withdraw</button>
      </div>
    </div>
  )
}

function TradingInterface() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, token: USDC_ADDRESS })
  const { startRound, isPending } = useStartRound()
  const [price, setPrice] = useState(65448.84)

  useEffect(() => {
    const timer = setInterval(() => setPrice(p => p + (Math.random() * 4 - 2)), 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '900px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        <div style={{ background: '#111827', padding: '30px', borderRadius: '24px', border: '1px solid #1e293b' }}>
          <h2 style={{ color: '#94a3b8', margin: 0, fontSize: '18px' }}>BTC / USDC</h2>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#10b981', margin: '10px 0' }}>${price.toFixed(2)}</div>
          <div style={{ height: '220px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', borderBottom: '2px solid #10b981' }}></div>
        </div>
        <div style={{ background: '#111827', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold' }}>WALLET BALANCE</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{balance?.formatted?.slice(0, 6) || '0.00'} USDC</div>
          </div>
          <button onClick={() => startRound('BTC')} disabled={isPending} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>Predict UP</button>
          <button onClick={() => startRound('BTC')} disabled={isPending} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Predict DOWN</button>
        </div>
      </div>
      <AdminPanel />
    </div>
  )
}

export default function App() {
  const [m, setM] = useState(false); useEffect(() => setM(true), []); if(!m) return null;
  return (
    <WagmiProvider config={config}><QueryClientProvider client={queryClient}><ConnectKitProvider theme="midnight">
      <div style={{ minHeight: '100vh', background: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
        <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '20px' }}>ArcPredict Pro</div>
          <ConnectKitButton />
        </nav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><TradingInterface /></div>
      </div>
    </ConnectKitProvider></QueryClientProvider></WagmiProvider>
  )
}
