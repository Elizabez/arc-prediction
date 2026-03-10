import { useState } from 'react'
import { WagmiProvider, useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet, tempoTestnet } from './wagmi'
import DashboardPage from './components/DashboardPage'
import TempoDashboardPage from './components/TempoDashboardPage'
import './components/dashboard.css'

const queryClient = new QueryClient()

const CHAINS = [
  { id: arcTestnet.id,   name: 'Arc Testnet',  emoji: '◈', color: '#3b82f6' },
  { id: tempoTestnet.id, name: 'Tempo Testnet', emoji: '🎵', color: '#8b5cf6' },
]

// ── Logo icon — quiz mark inside rounded hex ───────────────────────
const TQIcon = ({ color }: { color: string }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <rect x="1" y="1" width="32" height="32" rx="9" fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
    {/* Question mark arc */}
    <path
      d="M13.5 13.8C13.5 11.37 15.51 9.4 18 9.4C20.49 9.4 22.5 11.37 22.5 13.8C22.5 15.72 21.26 17.36 19.5 17.96L18 19.6"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    />
    {/* Dot */}
    <circle cx="18" cy="23.5" r="1.4" fill={color}/>
    {/* Small circuit dots for tech feel */}
    <circle cx="6" cy="6" r="1" fill={color} fillOpacity="0.3"/>
    <circle cx="28" cy="6" r="1" fill={color} fillOpacity="0.3"/>
    <circle cx="6" cy="28" r="1" fill={color} fillOpacity="0.3"/>
    <circle cx="28" cy="28" r="1" fill={color} fillOpacity="0.3"/>
  </svg>
)

function AppInner() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [showChainMenu, setShowChainMenu] = useState(false)

  const isArc   = chainId === arcTestnet.id
  const isTempo = chainId === tempoTestnet.id
  const isKnownChain = isArc || isTempo

  const activeChain = CHAINS.find(c => c.id === chainId)
  const accentColor = isArc ? '#3b82f6' : isTempo ? '#8b5cf6' : '#64748b'

  // Native token balance
  const { data: balance } = useBalance({ address: address ?? undefined })
  const balText = balance
    ? parseFloat(balance.formatted) > 1e6
      ? `∞ ${balance.symbol}`
      : `${parseFloat(balance.formatted).toFixed(2)} ${balance.symbol}`
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 24px', borderBottom: '1px solid #1e293b',
        background: '#0d1424', position: 'sticky', top: 0, zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <TQIcon color={accentColor} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#475569', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '2px' }}>
              Testnet
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: accentColor, letterSpacing: '-0.5px' }}>
              Quiz
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Native balance */}
          {isConnected && balText && (
            <div style={{
              background: '#131c2e', border: `1px solid ${accentColor}30`,
              borderRadius: '8px', padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, color: '#e2e8f0',
              fontFamily: 'monospace', letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: accentColor, display: 'inline-block', flexShrink: 0 }} />
              {balText}
            </div>
          )}

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

      {/* Content */}
      {!isConnected ? (
        <div style={{ maxWidth: '520px', margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <TQIcon color="#3b82f6" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>Testnet Quiz</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>Arc</span> &amp; <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Tempo</span> blockchain knowledge
          </p>
          <p style={{ color: '#475569', marginBottom: '32px', lineHeight: 1.7, fontSize: '14px' }}>
            Answer questions correctly → earn <strong style={{ color: '#e2e8f0' }}>Soulbound NFT badges</strong> on-chain.<br />
            Free to play · Non-transferable
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
          {isArc   && <DashboardPage />}
          {isTempo && <TempoDashboardPage />}
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
