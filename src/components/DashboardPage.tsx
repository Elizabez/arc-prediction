import { useAccount, useReadContract } from 'wagmi'
import { ARC_QUIZ_ABI, ARC_QUIZZES } from './ArcQuizData'
import { arcTestnet } from '../wagmi'

const QUIZ_CONTRACT = (import.meta.env['VITE_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  const { data: progress } = useReadContract({
    address: QUIZ_CONTRACT,
    abi: ARC_QUIZ_ABI,
    functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    query: { enabled: !!address && QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
    chainId: arcTestnet.id,
  })

  const { data: totalMinted } = useReadContract({
    address: QUIZ_CONTRACT,
    abi: ARC_QUIZ_ABI,
    functionName: 'totalMinted',
    chainId: arcTestnet.id,
    query: { enabled: QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
  })

  const progressArr = progress as boolean[] | undefined
  const completedCount = progressArr ? progressArr.filter(Boolean).length : 0
  const totalQuizzes = ARC_QUIZZES.length
  const completePct = Math.round((completedCount / totalQuizzes) * 100)

  const achievements = [
    completedCount >= 1,
    completedCount >= 5,
    completedCount >= 10,
  ].filter(Boolean).length

  const RADIUS = 54
  const CIRC = 2 * Math.PI * RADIUS
  const dashOffset = CIRC - (completePct / 100) * CIRC

  return (
    <div className="dashboard-page">
      <div className="dash-welcome">
        <div>
          <h1 className="dash-title">Welcome back 👋</h1>
          <p className="dash-subtitle">Arc Knowledge Quiz · {completedCount}/{totalQuizzes} completed</p>
        </div>
        {!isConnected && (
          <div className="dash-wallet-warning">⚠ Connect wallet to track progress</div>
        )}
      </div>

      <div className="dash-hero-card">
        <div className="dash-circle-wrap">
          <svg className="dash-circle-svg" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="64" cy="64" r={RADIUS}
              fill="none"
              stroke="url(#circleGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
            />
            <defs>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b7bff" />
                <stop offset="100%" stopColor="#00e5a0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="dash-circle-inner">
            <span className="dash-pct">{completePct}%</span>
            <span className="dash-pct-label">Complete</span>
          </div>
        </div>

        <div className="dash-hero-divider" />

        <div className="dash-hero-stats">
          <div className="dash-stat">
            <div className="dash-stat-icon">🎓</div>
            <div className="dash-stat-val">{completedCount}/{totalQuizzes}</div>
            <div className="dash-stat-label">Completed</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon">⭐</div>
            <div className="dash-stat-val">{completedCount > 0 ? '100%' : '—'}</div>
            <div className="dash-stat-label">Best Score</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon">🏆</div>
            <div className="dash-stat-val">{achievements}/3</div>
            <div className="dash-stat-label">Achievements</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon">🪙</div>
            <div className="dash-stat-val">{totalMinted?.toString() ?? '—'}</div>
            <div className="dash-stat-label">Total Minted</div>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Progress</h2>
        <div className="dash-levels">
          {[
            { label: 'Beginner', next: 'Explorer', max: 1 },
            { label: 'Explorer', next: 'Master', max: 5 },
            { label: 'Master', next: 'Complete!', max: 10 },
          ].map((level, i) => {
            const pct = Math.min(100, Math.round((completedCount / level.max) * 100))
            const reached = completedCount >= level.max
            return (
              <div key={i} className={`dash-level ${reached ? 'reached' : ''}`}>
                <div className="dash-level-left">
                  <span className="dash-level-num">{i + 1}</span>
                  <div>
                    <div className="dash-level-name">{level.label}</div>
                    <div className="dash-level-next">Next: {level.next}</div>
                  </div>
                </div>
                <div className="dash-level-right">
                  <span className="dash-level-pts">{completedCount} / {level.max} quizzes</span>
                  <div className="dash-level-bar">
                    <div className="dash-level-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Your Badges</h2>
        {completedCount === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">🔒</div>
            <p>No badges yet. Complete a quiz to earn your first Soulbound NFT!</p>
          </div>
        ) : (
          <div className="dash-badges-grid">
            {ARC_QUIZZES.map((quiz, i) => {
              const done = progressArr ? progressArr[i] : false
              return (
                <div key={quiz.id} className={`dash-badge-item ${done ? 'earned' : 'locked'}`}>
                  <div className="dash-badge-emoji">{done ? quiz.emoji : '🔒'}</div>
                  <div className="dash-badge-name">{quiz.title}</div>
                  {done && <div className="dash-badge-tag">SBT #{quiz.id}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
