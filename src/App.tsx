import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, USDC_ADDRESS } from './wagmi'
import { useStartRound, useAdminActions } from './hooks/usePrediction'

const queryClient = new QueryClient()

function AdminPanel() {
  const [adminAmount, setAdminAmount] = useState('5')
  const { approveUSDC, depositPool, withdrawPool, isPending } = useAdminActions()
  return (
    <div style={{ marginTop: '40px', padding: '25px', background: '#0f172a', borderRadius: '15px', border: '1px dashed #3b82f6' }}>
      <h3 style={{ color: '#3b82f6', fontSize: '12px', marginBottom: '15px' }}>ADMIN CONSOLE</h3>
      <input type="number" value={adminAmount} onChange={e => setAdminAmount(e.target.value)} style={{ width: '100%', background: '#1e293b', border: 'none', padding: '10px', borderRadius: '8px', color: 'white', marginBottom: '10px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <button onClick={() => approveUSDC(adminAmount)} style={{ background: '#334155', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>1. Approve</button>
        <button onClick={() => depositPool(adminAmount)} style={{ background: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>2. Deposit</button>
        <button onClick={() => withdrawPool(adminAmount)} style={{ background: '#991b1b', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>Withdraw</button>
      </div>
    </div>
  )
}

function TradingInterface() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, token: USDC_ADDRESS })
  const { startRound, isPending } = useStartRound()
  const [amount, setAmount] = useState('5')
  const [price, setPrice] = useState(65440.00)

  useEffect(() => {
    const timer = setInterval(() => setPrice(p => p + (Math.random() * 4 - 2)), 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '900px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        <div style={{ background: '#111827', padding: '30px', borderRadius: '20px', border: '1px solid #1e293b' }}>
          <h2 style={{ color: '#94a3b8', margin: 0 }}>BTC / USDC</h2>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#10b981' }}>${price.toFixed(2)}</div>
          <div style={{ height: '200px', marginTop: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', borderBottom: '2px solid #10b981' }}></div>
        </div>
        <div style={{ background: '#111827', padding: '25px', borderRadius: '20px', border: '1px solid #1e293b' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>WALLET BALANCE</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{balance?.formatted?.slice(0, 6) || '0.00'} USDC</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#64748b', fontSize: '12px' }}>AMOUNT</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '10px', color: 'white', marginTop: '5px' }} />
          </div>
          <button onClick={() => startRound('BTC', amount)} disabled={isPending} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>Predict UP</button>
          <button onClick={() => startRound('BTC', amount)} disabled={isPending} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Predict DOWN</button>
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
      <div style={{ minHeight: '100vh', background: '#020617', color: 'white' }}>
        <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>ArcPredict Pro</div>
          <ConnectKitButton />
        </nav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><TradingInterface /></div>
      </div>
    </ConnectKitProvider></QueryClientProvider></WagmiProvider>
  )
}
