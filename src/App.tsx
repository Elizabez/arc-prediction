import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { config, arcTestnet, tempoTestnet, robinhoodTestnet } from './wagmi'
import DashboardPage from './components/DashboardPage'
import TempoDashboardPage from './components/TempoDashboardPage'
import RobinhoodDashboardPage from './components/RobinhoodDashboardPage'
import LeaderboardPage from './components/LeaderboardPage'
import ProfilePage from './components/ProfilePage'
import { storeRefCode } from './components/referral'
import './components/dashboard.css'

const queryClient = new QueryClient()

const CHAINS = [
  { id: arcTestnet.id,        name: 'Arc Testnet',        emoji: '◈',  color: '#3b82f6' },
  { id: tempoTestnet.id,      name: 'Tempo Testnet',      emoji: '🎵', color: '#8b5cf6' },
  { id: robinhoodTestnet.id,  name: 'Robinhood Testnet',  emoji: '🔴', color: '#22c55e' },
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
  const [page, setPage] = useState<'chain' | 'leaderboard' | 'profile'>('chain')
  const [profileAddress, setProfileAddress] = useState('')
  const [refToast, setRefToast] = useState<string | null>(null)

  // Handle URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // ?ref=XXXXXXXX — store ref code, show toast
    const ref = params.get('ref')
    if (ref && /^[0-9a-fA-F]{8}$/.test(ref)) {
      storeRefCode(ref)
      setRefToast(ref.toLowerCase())
      setTimeout(() => setRefToast(null), 4000)
    }

    // ?profile=0x...
    const addr = params.get('profile')
    if (addr && addr.startsWith('0x')) {
      setProfileAddress(addr)
      setPage('profile')
    }
  }, [])

  function goProfile(addr: string) {
    setProfileAddress(addr)
    setPage('profile')
    window.history.pushState({}, '', `/?profile=${addr}`)
  }

  function goBack() {
    setPage('chain')
    window.history.pushState({}, '', '/')
  }

  const isArc       = chainId === arcTestnet.id
  const isTempo     = chainId === tempoTestnet.id
  const isRobinhood = chainId === robinhoodTestnet.id
  const isKnownChain = isArc || isTempo || isRobinhood

  const activeChain = CHAINS.find(c => c.id === chainId)
  const accentColor = isArc ? '#3b82f6' : isTempo ? '#8b5cf6' : isRobinhood ? '#22c55e' : '#64748b'

  // Native token balance
  const { data: balance } = useBalance({ address: address ?? undefined })
  const balText = balance
    ? `${parseFloat(balance.formatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${balance.symbol}`
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
      }}>

        {/* Logo — click to go home when on leaderboard / profile */}
        <div
          onClick={() => { if (page !== 'chain') goBack() }}
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            cursor: page !== 'chain' ? 'pointer' : 'default',
          }}
        >
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
              background: `rgba(13,20,36,0.7)`, border: `1px solid ${accentColor}25`,
              borderRadius: '999px', padding: '5px 14px',
              fontSize: '12px', fontWeight: 700, color: '#e2e8f0',
              fontFamily: 'monospace', letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', gap: '6px',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 12px ${accentColor}15`,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${accentColor}` }} />
              {balText}
            </div>
          )}

          {/* Profile button (connected only) */}
          {isConnected && address && (
            <button onClick={() => page === 'profile' && profileAddress === address ? goBack() : goProfile(address)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: page === 'profile' ? '#8b5cf622' : '#1e293b',
              border: `1px solid ${page === 'profile' ? '#8b5cf666' : '#334155'}`,
              borderRadius: '8px', color: page === 'profile' ? '#a78bfa' : '#94a3b8',
              cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: '6px 12px',
              transition: 'all 0.15s',
            }}>
              👤 Me
            </button>
          )}

          {/* Leaderboard button */}
          <button onClick={() => setPage(p => p === 'leaderboard' ? 'chain' : 'leaderboard')} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: page === 'leaderboard' ? '#f59e0b22' : '#1e293b',
            border: `1px solid ${page === 'leaderboard' ? '#f59e0b66' : '#334155'}`,
            borderRadius: '8px', color: page === 'leaderboard' ? '#f59e0b' : '#94a3b8',
            cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: '6px 12px',
            transition: 'all 0.15s',
          }}>
            🏆 <span style={{ display: 'none' }}>Leaderboard</span>
            <span style={{ display: 'inline' }}>Board</span>
          </button>

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
      {page === 'profile' && profileAddress ? (
        <ProfilePage profileAddress={profileAddress} connectedAddress={address} onBack={goBack} />
      ) : page === 'leaderboard' ? (
        <LeaderboardPage onViewProfile={goProfile} onBack={goBack} />
      ) : !isConnected ? (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px 80px' }}>

          {/* ── Hero ── */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '999px', padding: '5px 14px', marginBottom: '24px',
              fontSize: '12px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em',
            }}>
              <span>🏆</span> LEARN · QUIZ · EARN ON-CHAIN
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 900, lineHeight: 1.12,
              marginBottom: '20px', letterSpacing: '-1.5px',
            }}>
              Master Blockchain.<br />
              <span style={{
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #22c55e 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Earn Soulbound Badges.</span>
            </h1>

            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 36px', fontWeight: 400 }}>
              Answer questions about the hottest testnets → mint{' '}
              <strong style={{ color: '#cbd5e1', fontWeight: 700 }}>non-transferable NFT badges</strong>{' '}
              proving your knowledge on-chain. Free to play.
            </p>

            <ConnectKitButton />

            {/* Subtle stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '32px' }}>
              {[
                { value: '3', label: 'Active Chains' },
                { value: '48', label: 'Quiz Questions' },
                { value: 'Free', label: 'To Play' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#e2e8f0' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chain Cards ── */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Supported Networks
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
              {[
                {
                  color: '#3b82f6', emoji: '◈', name: 'Arc Testnet',
                  tag: 'AVM L2/L3', quizzes: '16 quizzes',
                  desc: 'Next-gen blockchain with AVM-powered smart contracts and ultra-low fees.',
                },
                {
                  color: '#8b5cf6', emoji: '🎵', name: 'Tempo Testnet',
                  tag: 'TIP-1000', quizzes: '16 quizzes',
                  desc: 'Music-themed chain with a unique anti-spam gas mechanism (TIP-1000).',
                },
                {
                  color: '#22c55e', emoji: '🔴', name: 'Robinhood Chain',
                  tag: 'Arbitrum Orbit', quizzes: '16 quizzes',
                  desc: 'DeFi-focused L2 built on Arbitrum Orbit for retail-friendly finance.',
                },
                {
                  color: '#475569', emoji: '＋', name: 'More Coming',
                  tag: 'Soon™', quizzes: '— quizzes',
                  desc: 'New chains are added regularly. Stay tuned for the next drop.',
                  isComingSoon: true,
                },
              ].map(chain => (
                <div key={chain.name} style={{
                  background: (chain as any).isComingSoon
                    ? 'rgba(255,255,255,0.02)'
                    : `linear-gradient(135deg, ${chain.color}0d 0%, rgba(10,15,26,0) 60%)`,
                  border: `1px solid ${(chain as any).isComingSoon ? 'rgba(255,255,255,0.06)' : chain.color + '30'}`,
                  borderRadius: '16px', padding: '24px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  ...(!(chain as any).isComingSoon ? { boxShadow: `0 0 0 0 ${chain.color}00` } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '26px', width: '44px', height: '44px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${chain.color}18`, borderRadius: '10px',
                      color: chain.color,
                    }}>{chain.emoji}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, color: chain.color,
                      background: `${chain.color}18`, borderRadius: '6px',
                      padding: '3px 8px', letterSpacing: '0.06em',
                      opacity: (chain as any).isComingSoon ? 0.5 : 1,
                    }}>{chain.tag}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: (chain as any).isComingSoon ? '#475569' : '#e2e8f0', marginBottom: '6px' }}>
                    {chain.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', lineHeight: 1.5 }}>
                    {chain.desc}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: chain.color, opacity: (chain as any).isComingSoon ? 0.4 : 0.8 }}>
                    {chain.quizzes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── How it works ── */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '28px' }}>
              How It Works
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', maxWidth: '680px', margin: '0 auto' }}>
              {[
                { step: '01', icon: '🔗', title: 'Connect Wallet', desc: 'Use MetaMask, OKX, or any EVM wallet' },
                { step: '02', icon: '🧠', title: 'Take the Quiz', desc: 'Answer 3 questions about the chain' },
                { step: '03', icon: '🏅', title: 'Mint your Badge', desc: 'Get a Soulbound NFT — yours forever' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '20px 16px', position: 'relative' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.icon}</div>
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    fontSize: '10px', fontWeight: 800, color: '#3b82f6',
                    opacity: 0.5, letterSpacing: '0.08em',
                  }}>{item.step}</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#e2e8f0', marginBottom: '6px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{
            textAlign: 'center', padding: '40px 32px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(59,130,246,0.15)', borderRadius: '20px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Ready to prove your knowledge?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Connect your wallet and start earning badges for free.</p>
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
          {isArc       && <DashboardPage />}
          {isTempo     && <TempoDashboardPage />}
          {isRobinhood && <RobinhoodDashboardPage />}
        </>
      )}

      {showChainMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowChainMenu(false)} />
      )}

      {/* Referral activated toast */}
      {refToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          background: '#0d1424', border: '1px solid #10b98155',
          borderRadius: '12px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <span style={{ fontSize: '18px' }}>🔗</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>Referral link activated!</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Referrer: {refToast}</div>
          </div>
        </div>
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
