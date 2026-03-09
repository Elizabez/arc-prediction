import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { ARC_QUIZ_ABI, ARC_QUIZZES, getArcUnlockedCount } from './ArcQuizData'
import { arcTestnet } from '../wagmi'

const QUIZ_CONTRACT = (import.meta.env['VITE_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`
const APP_URL = 'https://testnet-quiz.vercel.app'

// ── Badge tier by quiz id ──────────────────────────────────────────
const BADGE_TIERS = [
  { maxId: 4,  label: 'Bronze',  color: '#cd7f32', bg: '#cd7f3214', border: '#cd7f3260' },
  { maxId: 8,  label: 'Silver',  color: '#94a3b8', bg: '#94a3b814', border: '#94a3b860' },
  { maxId: 12, label: 'Gold',    color: '#f59e0b', bg: '#f59e0b14', border: '#f59e0b60' },
  { maxId: 99, label: 'Diamond', color: '#a78bfa', bg: '#a78bfa14', border: '#a78bfa60' },
]
function getBadgeTier(quizId: number) {
  return BADGE_TIERS.find(t => quizId <= t.maxId)!
}

// ── User overall level ─────────────────────────────────────────────
const USER_LEVELS = [
  { min: 0,  max: 1,        label: 'Newcomer', color: '#64748b', icon: '🌱' },
  { min: 1,  max: 4,        label: 'Beginner', color: '#cd7f32', icon: '🥉' },
  { min: 4,  max: 8,        label: 'Explorer', color: '#94a3b8', icon: '🥈' },
  { min: 8,  max: 12,       label: 'Expert',   color: '#f59e0b', icon: '🥇' },
  { min: 12, max: 16,       label: 'Master',   color: '#a78bfa', icon: '💎' },
  { min: 16, max: Infinity, label: 'Legend',   color: '#ec4899', icon: '👑' },
]
function getUserLevel(count: number) {
  return USER_LEVELS.find(l => count >= l.min && count < l.max) ?? USER_LEVELS[USER_LEVELS.length - 1]
}

// ── SVG Icons ──────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)
const DiscordIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.083.115 18.108.132 18.124a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

// ── Twitter Timeline Embed ─────────────────────────────────────────
function TwitterFeed({ handle }: { handle: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function load() {
      if (ref.current && (window as any).twttr?.widgets) {
        ;(window as any).twttr.widgets.load(ref.current)
      }
    }
    if ((window as any).twttr) { load(); return }
    const s = document.createElement('script')
    s.src = 'https://platform.twitter.com/widgets.js'
    s.onload = load
    document.head.appendChild(s)
  }, [handle])
  return (
    <div ref={ref}>
      <a className="twitter-timeline" data-theme="dark" data-height="320"
        data-chrome="noheader nofooter noborders"
        href={`https://twitter.com/${handle}`}>
        Loading...
      </a>
    </div>
  )
}

function SocialLink({ icon, label, url, color }: { icon: React.ReactNode; label: string; url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: '8px', padding: '9px 12px',
      color, textDecoration: 'none', fontSize: '13px', fontWeight: 600,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.4 }}>↗</span>
    </a>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)
  const [unlockedCount] = useState(getArcUnlockedCount())

  const refUrl = `${APP_URL}?ref=${address?.slice(2, 10) ?? 'arc'}`

  const { data: progress } = useReadContract({
    address: QUIZ_CONTRACT, abi: ARC_QUIZ_ABI, functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    query: { enabled: !!address && QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
    chainId: arcTestnet.id,
  })
  const { data: totalMinted } = useReadContract({
    address: QUIZ_CONTRACT, abi: ARC_QUIZ_ABI, functionName: 'totalMinted',
    chainId: arcTestnet.id,
    query: { enabled: QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
  })
  const { data: myBadgeCount } = useReadContract({
    address: QUIZ_CONTRACT, abi: ARC_QUIZ_ABI, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
    chainId: arcTestnet.id,
  })

  const progressArr = progress ? [...progress] : Array(ARC_QUIZZES.length).fill(false)
  const completedCount = progressArr.filter(Boolean).length
  const level = getUserLevel(completedCount)
  const nextLevelIdx = USER_LEVELS.findIndex(l => l.label === level.label) + 1
  const nextLevel = USER_LEVELS[nextLevelIdx]
  const levelPct = nextLevel ? Math.round(((completedCount - level.min) / (nextLevel.min - level.min)) * 100) : 100

  function copyRef() {
    navigator.clipboard.writeText(refUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  function shareOnX() {
    const text = `Just earned Soulbound NFT badges learning #Arc blockchain! 🏆\nJoin me on @OnChainGM Quiz — learn & earn for free:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refUrl)}`, '_blank')
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>Welcome back 👋</h1>
        <div style={{
          background: `${level.color}22`, border: `1px solid ${level.color}55`,
          borderRadius: '999px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: level.color,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {level.icon} {level.label}
        </div>
        {address && (
          <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {address.slice(0, 6)}...{address.slice(-4)} · Arc Testnet
          </span>
        )}
        {!isConnected && (
          <div style={{ background: '#f5c84222', border: '1px solid #f5c84266', color: '#f5c842', padding: '8px 14px', borderRadius: '10px', fontSize: '13px' }}>
            ⚠ Connect wallet to track progress
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: '🎓', value: `${completedCount}/${ARC_QUIZZES.length}`, label: 'Completed' },
          { icon: '🏅', value: myBadgeCount?.toString() ?? '0',           label: 'My Badges' },
          { icon: '🌍', value: totalMinted?.toString() ?? '—',            label: 'Total Minted' },
          { icon: '🔓', value: `${unlockedCount}/16`,                     label: 'Unlocked' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '14px', padding: '18px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 2-column layout */}
      <div className="dash-2col">

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Level Progress */}
          <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{level.icon}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: level.color }}>{level.label}</div>
                  {nextLevel && <div style={{ fontSize: '12px', color: '#64748b' }}>Next: {nextLevel.icon} {nextLevel.label}</div>}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{completedCount}/{nextLevel ? nextLevel.min : 16}</span>
            </div>
            <div style={{ height: '8px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{
                height: '100%', width: `${levelPct}%`,
                background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color ?? level.color})`,
                borderRadius: '999px', transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {USER_LEVELS.filter(l => isFinite(l.max)).map(l => (
                <div key={l.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', filter: completedCount >= l.min ? 'none' : 'grayscale(1) opacity(0.3)' }}>{l.icon}</div>
                  <div style={{ fontSize: '9px', color: completedCount >= l.min ? l.color : '#334155', fontWeight: 700, marginTop: '3px' }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badge Grid */}
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px', paddingBottom: '10px', borderBottom: '1px solid #1e293b' }}>
              Arc Badges · {completedCount}/{ARC_QUIZZES.length} earned
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {BADGE_TIERS.map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: t.color }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: t.color }} />{t.label} (quiz {t.maxId <= 4 ? '1–4' : t.maxId <= 8 ? '5–8' : t.maxId <= 12 ? '9–12' : '13–16'})
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
              {ARC_QUIZZES.map((quiz, i) => {
                const done = progressArr[i] as boolean
                const unlocked = i < unlockedCount
                const tier = getBadgeTier(quiz.id)
                return (
                  <div key={quiz.id} style={{
                    background: done ? tier.bg : '#0d1424',
                    border: `1px solid ${done ? tier.border : unlocked ? '#1e293b' : '#0f172a'}`,
                    borderRadius: '12px', padding: '14px 8px', textAlign: 'center',
                    opacity: unlocked ? 1 : 0.3, position: 'relative', transition: 'all 0.2s',
                  }}>
                    {done && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: tier.color, borderRadius: '0 12px 0 8px',
                        padding: '2px 6px', fontSize: '8px', fontWeight: 900, color: '#000',
                      }}>{tier.label}</div>
                    )}
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{done ? quiz.emoji : unlocked ? quiz.emoji : '🔒'}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: done ? '#e2e8f0' : '#475569', lineHeight: 1.3 }}>{quiz.title}</div>
                    {done && <div style={{ marginTop: '5px', fontSize: '10px', color: tier.color, fontWeight: 700 }}>✓ SBT #{quiz.id}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Referral */}
          {isConnected && (
            <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 6px' }}>🔗 Referral Link</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>Invite friends to learn & earn Soulbound badges</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {refUrl}
                </div>
                <button onClick={copyRef} style={{
                  background: copied ? '#10b98120' : '#1e293b', border: `1px solid ${copied ? '#10b981' : '#334155'}`,
                  borderRadius: '10px', color: copied ? '#10b981' : '#94a3b8',
                  cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: '10px 16px', whiteSpace: 'nowrap',
                }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button onClick={shareOnX} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', background: '#000', border: '1px solid #333',
                borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px', padding: '12px',
              }}>
                <XIcon /> Share on X
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Project Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>◈</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#3b82f6' }}>Arc Testnet</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>by Circle · Chain ID 5042002</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SocialLink icon={<XIcon />}       label="@circle"              url="https://twitter.com/circle"         color="#fff" />
              <SocialLink icon={<DiscordIcon />} label="Discord"              url="https://discord.gg/buildwitharc"    color="#5865f2" />
              <SocialLink icon={<GlobeIcon />}   label="arc.circle.com"       url="https://arc.circle.com"             color="#3b82f6" />
              <SocialLink icon={<GlobeIcon />}   label="testnet.arcscan.app"  url="https://testnet.arcscan.app"        color="#64748b" />
              <SocialLink icon={<GlobeIcon />}   label="faucet.circle.com"    url="https://faucet.circle.com"          color="#10b981" />
            </div>
          </div>

          <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Network Info</div>
            {[['Chain ID','5042002'],['Gas Token','USDC'],['Finality','< 1s'],['EVM','Compatible'],['Consensus','Malachite BFT']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #0f172a', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{k}</span>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XIcon />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Latest from @circle</span>
              <a href="https://twitter.com/circle" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontSize: '11px', color: '#3b82f6', textDecoration: 'none' }}>View all →</a>
            </div>
            <TwitterFeed handle="circle" />
          </div>

        </div>
      </div>
    </div>
  )
}
