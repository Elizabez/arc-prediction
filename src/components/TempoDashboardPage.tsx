import { useAccount, useReadContract } from 'wagmi'
import { TEMPO_QUIZ_ABI, TEMPO_QUIZZES, getUnlockedCount, formatUnlockDate } from './TempoQuizData'
import { tempoTestnet } from '../wagmi'

const TEMPO_QUIZ_CONTRACT = (import.meta.env['VITE_TEMPO_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

export default function TempoDashboardPage() {
  const { address, isConnected } = useAccount()
  const unlockedCount = getUnlockedCount()

  const { data: progressData } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT,
    abi: TEMPO_QUIZ_ABI,
    functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id,
    query: { enabled: !!address },
  })

  const { data: totalMinted } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT,
    abi: TEMPO_QUIZ_ABI,
    functionName: 'totalMinted',
    chainId: tempoTestnet.id,
  })

  const { data: myBadges } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT,
    abi: TEMPO_QUIZ_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id,
    query: { enabled: !!address },
  })

  const progress: boolean[] = progressData ? [...progressData] : Array(20).fill(false)
  const completedCount = progress.filter(Boolean).length
  const percent = Math.round((completedCount / unlockedCount) * 100) || 0

  const level = completedCount === 0 ? 'Beginner'
    : completedCount < 5  ? 'Explorer'
    : completedCount < 10 ? 'Builder'
    : completedCount < 16 ? 'Expert'
    : 'Tempo Master'

  const levelColor = completedCount === 0 ? '#64748b'
    : completedCount < 5  ? '#8b5cf6'
    : completedCount < 10 ? '#a78bfa'
    : completedCount < 16 ? '#c4b5fd'
    : '#e9d5ff'

  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference - (percent / 100) * circumference

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ color: '#8b5cf6' }}>🎵</span> Tempo Dashboard
        </h1>
        <p className="dashboard-subtitle">
          {isConnected
            ? `${address?.slice(0, 6)}...${address?.slice(-4)} · Moderato Testnet`
            : 'Connect your wallet to view progress'}
        </p>
      </div>

      {/* Progress Ring */}
      <div className="progress-section">
        <div className="progress-ring-container">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="12" />
            <circle
              cx="70" cy="70" r="54" fill="none"
              stroke="#8b5cf6" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="progress-ring-text">
            <span className="progress-percent" style={{ color: '#8b5cf6' }}>{percent}%</span>
            <span className="progress-label">of unlocked</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{completedCount}/{unlockedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#a78bfa' }}>{myBadges?.toString() ?? '0'}</div>
            <div className="stat-label">My Badges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#c4b5fd' }}>{totalMinted?.toString() ?? '0'}</div>
            <div className="stat-label">Total Minted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: levelColor, fontSize: '14px' }}>{level}</div>
            <div className="stat-label">Level</div>
          </div>
        </div>
      </div>

      {/* Upcoming unlock */}
      {unlockedCount < 20 && (
        <div style={{
          background: '#0d1424', border: '1px solid #8b5cf630',
          borderRadius: '12px', padding: '14px 18px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div>
            <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 700 }}>
              Next quiz unlocks: Quiz {unlockedCount + 1} — {TEMPO_QUIZZES[unlockedCount].title}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Available on {formatUnlockDate(unlockedCount + 1)}
            </div>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      <div className="badges-section">
        <h2 className="section-title">All 20 Badges</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
        }}>
          {TEMPO_QUIZZES.map((quiz, i) => {
            const unlocked = i < unlockedCount
            const done = progress[i]
            return (
              <div key={quiz.id} style={{
                background: '#0d1424',
                border: `1px solid ${done ? '#8b5cf6' : unlocked ? '#334155' : '#1e293b'}`,
                borderRadius: '12px', padding: '16px 10px', textAlign: 'center',
                opacity: unlocked ? 1 : 0.4, position: 'relative',
              }}>
                {!unlocked && (
                  <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    fontSize: '9px', color: '#475569', fontWeight: 700,
                    background: '#1e293b', borderRadius: '4px', padding: '2px 5px',
                  }}>
                    {formatUnlockDate(quiz.id)}
                  </div>
                )}
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                  {done ? quiz.emoji : unlocked ? quiz.emoji : '🔒'}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: '6px' }}>
                  {quiz.title}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600 }}>
                  {done
                    ? <span style={{ color: '#8b5cf6' }}>✓ Earned</span>
                    : unlocked
                    ? <span style={{ color: '#64748b' }}>Available</span>
                    : <span style={{ color: '#475569' }}>Locked</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chain Info */}
      <div style={{
        marginTop: '28px', padding: '18px', background: '#0d1424',
        borderRadius: '12px', border: '1px solid #8b5cf630',
      }}>
        <h3 style={{ color: '#8b5cf6', marginBottom: '12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🎵 Tempo Testnet Info
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          {[
            ['Chain ID', '42431'],
            ['Network', 'Moderato'],
            ['RPC', 'rpc.moderato.tempo.xyz'],
            ['Explorer', 'explore.tempo.xyz'],
            ['Faucet', 'docs.tempo.xyz/quickstart/faucet'],
            ['Gas Token', 'AlphaUSD (stablecoin)'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '6px' }}>
              <span style={{ color: '#64748b', minWidth: '76px' }}>{k}:</span>
              <span style={{ color: '#a78bfa' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
