import { useState } from 'react'
import { WagmiProvider, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet, tempoTestnet } from './wagmi'
import QuizPage from './components/QuizPage'
import TempoQuizPage from './components/TempoQuizPage'
import DashboardPage from './components/DashboardPage'
import TempoDashboardPage from './components/TempoDashboardPage'
import './components/dashboard.css'

const queryClient = new QueryClient()

const CHAINS = [
  { id: arcTestnet.id,   name: 'Arc Testnet',  emoji: '◈', color: '#3b82f6' },
  { id: tempoTestnet.id, name: 'Tempo Testnet', emoji: '🎵', color: '#8b5cf6' },
]

function AppInner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [page, setPage] = useState<'dashboard' | 'quiz'>('dashboard')
  const [showChainMenu, setShowChainMenu] = useState(false)

  const isArc   = chainId === arcTestnet.id
  const isTempo = chainId === tempoTestnet.id
  const isKnownChain = isArc || isTempo

  const activeChain = CHAINS.find(c => c.id === chainId)
  const accentColor = isArc ? '#3b82f6' : isTempo ? '#8b5cf6' : '#64748b'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', borderBottom: '1px solid #1e293b',
        background: '#0d1424', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: accentColor, letterSpacing: '-0.5px' }}>
            ◈ OnChainGM
          </span>

          <button onClick={() => setPage('quiz')} style={{
            background: page === 'quiz' ? `${accentColor}20` : 'none',
            border: page === 'quiz' ? `1px solid ${accentColor}50` : '1px solid transparent',
            borderRadius: '8px', color: page === 'quiz' ? accentColor : '#64748b',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '6px 14px',
          }}>
            🧠 Quiz
          </button>

          <button onClick={() => setPage('dashboard')} style={{
            background: page === 'dashboard' ? `${accentColor}20` : 'none',
            border: page === 'dashboard' ? `1px solid ${accentColor}50` : '1px solid transparent',
            borderRadius: '8px', color: page === 'dashboard' ? accentColor : '#64748b',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '6px 14px',
          }}>
            📊 Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Chain switcher */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowChainMenu(!showChainMenu)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#1e293b', border: `1px solid ${accentColor}40`,
              borderRadius: '8px', color: '#e2e8f0',
              cursor: 'pointer', fontWeight: 600, fontSize: '12px', padding: '6px 12px',
            }}>
              <span>{activeChain?.emoji ?? '🌐'}</span>
              <span>{activeChain?.name ?? 'Unknown'}</span>
              <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
            </button>

            {showChainMenu && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '10px', padding: '6px', minWidth: '160px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200,
              }}>
                {CHAINS.map(chain => (
                  <button key={chain.id} onClick={() => { switchChain({ chainId: chain.id }); setShowChainMenu(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', background: chainId === chain.id ? `${chain.color}20` : 'none',
                    border: 'none', borderRadius: '7px', color: chainId === chain.id ? chain.color : '#94a3b8',
                    cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: '8px 10px', textAlign: 'left',
                  }}>
                    <span>{chain.emoji}</span>
                    <span>{chain.name}</span>
                    {chainId === chain.id && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ConnectKitButton />
        </div>
      </nav>

      {/* Pages */}
      {!isConnected ? (
        <div style={{ maxWidth: '520px', margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>◈</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>OnChainGM Quiz</h1>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
            Learn about Arc & Tempo blockchains.<br />
            Answer correctly → earn Soulbound NFT badges.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectKitButton />
          </div>
        </div>
      ) : !isKnownChain ? (
        <div style={{ maxWidth: '480px', margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontWeight: 900, marginBottom: '12px' }}>Unsupported Network</h2>
          <p style={{ color: '#64748b', marginBottom: '28px' }}>Switch to Arc Testnet or Tempo Testnet</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {CHAINS.map(chain => (
              <button key={chain.id} onClick={() => switchChain({ chainId: chain.id })} style={{
                background: `${chain.color}20`, border: `1px solid ${chain.color}`,
                borderRadius: '10px', color: chain.color,
                cursor: 'pointer', fontWeight: 700, fontSize: '14px', padding: '10px 20px',
              }}>
                {chain.emoji} {chain.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {page === 'dashboard' && isArc   && <DashboardPage />}
          {page === 'dashboard' && isTempo && <TempoDashboardPage />}
          {page === 'quiz'      && isArc   && <QuizPage />}
          {page === 'quiz'      && isTempo && <TempoQuizPage />}
        </>
      )}

      {showChainMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowChainMenu(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="midnight">
          <AppInner />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
