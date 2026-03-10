import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TEMPO_QUIZ_ABI, TEMPO_QUIZZES, getTempoUnlockedCount, type QuizData } from './TempoQuizData'
import { tempoTestnet } from '../wagmi'

const TEMPO_QUIZ_CONTRACT = (import.meta.env['VITE_TEMPO_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000').trim() as `0x${string}`
const APP_URL = 'https://www.testnetquiz.xyz'
const ACC = '#8b5cf6'

// ── Badge tiers (20 quizzes: 5/10/15/20) ──────────────────────────
const BADGE_TIERS = [
  { maxId: 5,  label: 'Bronze',  color: '#cd7f32', bg: '#cd7f3214', border: '#cd7f3260' },
  { maxId: 10, label: 'Silver',  color: '#94a3b8', bg: '#94a3b814', border: '#94a3b860' },
  { maxId: 15, label: 'Gold',    color: '#f59e0b', bg: '#f59e0b14', border: '#f59e0b60' },
  { maxId: 99, label: 'Diamond', color: '#a78bfa', bg: '#a78bfa14', border: '#a78bfa60' },
]
function getBadgeTier(quizId: number) {
  return BADGE_TIERS.find(t => quizId <= t.maxId)!
}

// ── User levels (based on 20 quizzes) ─────────────────────────────
const USER_LEVELS = [
  { min: 0,  max: 1,        label: 'Newcomer', color: '#64748b', icon: '🌱' },
  { min: 1,  max: 5,        label: 'Beginner', color: '#cd7f32', icon: '🥉' },
  { min: 5,  max: 10,       label: 'Explorer', color: '#94a3b8', icon: '🥈' },
  { min: 10, max: 15,       label: 'Expert',   color: '#f59e0b', icon: '🥇' },
  { min: 15, max: 20,       label: 'Master',   color: '#a78bfa', icon: '💎' },
  { min: 20, max: Infinity, label: 'Legend',   color: '#ec4899', icon: '👑' },
]
function getUserLevel(count: number) {
  return USER_LEVELS.find(l => count >= l.min && count < l.max) ?? USER_LEVELS[USER_LEVELS.length - 1]
}

// ── Icons ──────────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

// ── Quiz Player ────────────────────────────────────────────────────
function QuizPlayer({ quiz, onPass, onBack }: {
  quiz: QuizData; onPass: (answers: number[]) => void; onBack: () => void
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const question = quiz.questions[step]
  const total = quiz.questions.length
  const isLast = step === total - 1
  const isCorrect = revealed && selected === question.correctIndex
  const tier = getBadgeTier(quiz.id)
  const barPct = Math.round(((step + (revealed && isCorrect ? 1 : 0)) / total) * 100)

  function confirm() {
    if (selected === null) return
    setRevealed(true)
  }

  function next() {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    if (selected !== question.correctIndex) {
      setStep(0); setAnswers([]); setSelected(null); setRevealed(false)
      return
    }
    if (isLast) {
      onPass(newAnswers)
    } else {
      setAnswers(newAnswers); setStep(step + 1); setSelected(null); setRevealed(false)
    }
  }

  const cardBorder = revealed ? (isCorrect ? '#10b98133' : '#ef444433') : '#1e293b'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid #1e293b', borderRadius: '8px',
          color: '#64748b', cursor: 'pointer', fontSize: '13px', padding: '7px 14px', fontWeight: 600,
        }}>← Dashboard</button>
        <span style={{ fontSize: '13px', color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>
          {step + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: '#0f172a', borderRadius: '999px', marginBottom: '28px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '999px',
          background: `linear-gradient(90deg, ${ACC}, ${ACC}88)`,
          width: `${barPct}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Badge pill */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          background: `${ACC}12`, border: `1px solid ${ACC}28`,
          borderRadius: '14px', padding: '12px 20px',
        }}>
          <span style={{ fontSize: '28px' }}>{quiz.emoji}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9' }}>{quiz.title}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Soulbound NFT · {tier.label} Badge</div>
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
        {quiz.questions.map((_, i) => (
          <div key={i} style={{
            height: '6px', borderRadius: '3px',
            width: i === step ? '28px' : '6px',
            background: i < step ? ACC : i === step ? ACC : '#1e293b',
            opacity: i < step ? 0.5 : 1,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Question card */}
      <div style={{
        background: '#0d1424', border: `1px solid ${cardBorder}`,
        borderRadius: '20px', padding: '28px',
        transition: 'border-color 0.3s', marginBottom: '12px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: ACC, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
          Question {step + 1}
        </div>
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.6, margin: '0 0 24px' }}>
          {question.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {question.options.map((opt, i) => {
            let bg = '#131c2e', border = '#1e293b', color = '#cbd5e1'
            let lBg = '#1e293b', lColor = '#64748b'
            if (revealed) {
              if (i === question.correctIndex) { bg = '#052e16'; border = '#10b981'; color = '#6ee7b7'; lBg = '#10b981'; lColor = '#000' }
              else if (i === selected) { bg = '#450a0a'; border = '#ef4444'; color = '#fca5a5'; lBg = '#ef4444'; lColor = '#fff' }
            } else if (i === selected) {
              bg = `${ACC}18`; border = ACC; color = '#f1f5f9'; lBg = ACC; lColor = '#fff'
            }
            return (
              <button key={i} onClick={() => !revealed && setSelected(i)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: bg, border: `1px solid ${border}`, borderRadius: '12px',
                color, cursor: revealed ? 'default' : 'pointer',
                fontSize: '14px', fontWeight: 500, padding: '13px 16px',
                textAlign: 'left', transition: 'all 0.15s', width: '100%',
              }}>
                <span style={{
                  minWidth: '30px', height: '30px', borderRadius: '8px',
                  background: lBg, color: lColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, flexShrink: 0, transition: 'all 0.15s',
                }}>{['A', 'B', 'C', 'D'][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {revealed && i === question.correctIndex && <span style={{ fontSize: '14px' }}>✓</span>}
                {revealed && i === selected && i !== question.correctIndex && <span style={{ fontSize: '14px' }}>✗</span>}
              </button>
            )
          })}
        </div>

        {/* Confirm */}
        {!revealed && (
          <button onClick={confirm} disabled={selected === null} style={{
            width: '100%', padding: '14px',
            background: selected !== null ? `linear-gradient(135deg, ${ACC}, ${ACC}cc)` : '#131c2e',
            border: `1px solid ${selected !== null ? ACC + '80' : '#1e293b'}`,
            borderRadius: '12px', color: selected !== null ? '#fff' : '#334155',
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            fontWeight: 800, fontSize: '15px', transition: 'all 0.2s',
          }}>
            Confirm Answer
          </button>
        )}
      </div>

      {/* Feedback + action */}
      {revealed && (
        <>
          <div style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '12px',
            background: isCorrect ? '#052e1680' : '#2d0a0a80',
            border: `1px solid ${isCorrect ? '#10b98140' : '#ef444440'}`,
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}>
            <span style={{ fontSize: '20px', marginTop: '1px' }}>{isCorrect ? '🎯' : '💡'}</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isCorrect ? '#4ade80' : '#f87171', marginBottom: '3px' }}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {isCorrect
                  ? isLast ? 'All done! Mint your Soulbound badge.' : 'Moving to next question…'
                  : `Correct answer: "${question.options[question.correctIndex]}" — Quiz restarts from Q1.`}
              </div>
            </div>
          </div>
          <button onClick={next} style={{
            width: '100%', padding: '14px',
            background: isCorrect
              ? `linear-gradient(135deg, ${ACC}, ${ACC}cc)`
              : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
            border: 'none', borderRadius: '12px', color: '#fff',
            cursor: 'pointer', fontWeight: 800, fontSize: '15px',
          }}>
            {isCorrect ? (isLast ? '🎉 Mint My Badge' : 'Next Question →') : '↺ Try Again from Q1'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Mint Badge ─────────────────────────────────────────────────────
function MintBadge({ quiz, answers, onDone }: {
  quiz: QuizData; answers: number[]; onDone: () => void
}) {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
  const tier = getBadgeTier(quiz.id)
  const refUrl = `${APP_URL}?ref=${address?.slice(2, 10) ?? 'tempo'}&chain=tempo`

  function handleMint() {
    writeContract({
      address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI,
      functionName: 'submitQuiz',
      args: [BigInt(quiz.id), answers.map(a => a as number)],
      chainId: tempoTestnet.id,
      gas: BigInt(1500000),
    })
  }

  function shareOnX() {
    const text = `Just minted "${quiz.emoji} ${quiz.title}" Soulbound NFT on #Tempo Testnet! 🎵\n\nEarn yours free on @OnChainGM Quiz:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refUrl)}`, '_blank')
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
      <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px' }}>All Correct!</h2>
      <p style={{ color: '#94a3b8', marginBottom: '28px', fontSize: '15px', lineHeight: 1.6 }}>
        Mint your <strong style={{ color: '#f1f5f9' }}>{quiz.emoji} {quiz.title}</strong> Soulbound badge on Tempo Testnet!
      </p>

      {/* Badge preview */}
      <div style={{
        background: `linear-gradient(135deg, ${ACC}18, #0d1424)`,
        border: `2px solid ${ACC}44`, borderRadius: '20px',
        padding: '28px', marginBottom: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: tier.color, borderRadius: '0 20px 0 10px',
          padding: '4px 12px', fontSize: '11px', fontWeight: 900, color: '#000',
        }}>{tier.label}</div>
        <div style={{ fontSize: '52px', marginBottom: '10px' }}>{quiz.emoji}</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Tempo Quiz Badge #{quiz.id}</div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>Soulbound NFT · Non-transferable · Moderato</div>
      </div>

      {!isSuccess && (
        <button onClick={handleMint} disabled={isPending || isConfirming} style={{
          width: '100%', padding: '15px',
          background: `linear-gradient(135deg, ${ACC}, ${ACC}cc)`,
          border: 'none', borderRadius: '12px', color: '#fff',
          cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
          fontWeight: 800, fontSize: '16px', marginBottom: '10px',
          opacity: isPending || isConfirming ? 0.7 : 1,
        }}>
          {isPending ? 'Confirm in wallet…' : isConfirming ? '⏳ Minting…' : '🎵 Mint Tempo Badge'}
        </button>
      )}

      {error && (
        <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', padding: '12px', background: '#1e293b', borderRadius: '10px', textAlign: 'left' }}>
          {error.message.slice(0, 150)}
        </div>
      )}

      {isSuccess && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <div style={{ color: ACC, fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Badge minted on Tempo Testnet!</div>
          {hash && (
            <a href={`https://explore.tempo.xyz/tx/${hash}`} target="_blank" rel="noreferrer"
              style={{ color: '#a78bfa', fontSize: '13px', display: 'block', marginBottom: '20px', textDecoration: 'none' }}>
              View on Tempo Explorer →
            </a>
          )}
          <button onClick={shareOnX} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', background: '#000', border: '1px solid #333',
            borderRadius: '12px', color: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: '15px', padding: '14px', marginBottom: '10px',
          }}>
            <XIcon /> Share on X
          </button>
        </div>
      )}

      <button onClick={onDone} style={{
        width: '100%', padding: '12px',
        background: 'none', border: `1px solid ${isSuccess ? ACC + '44' : '#1e293b'}`,
        borderRadius: '12px', color: isSuccess ? ACC : '#64748b',
        cursor: 'pointer', fontWeight: 700, fontSize: '14px',
      }}>← Back to Dashboard</button>
    </div>
  )
}

// ── Twitter Feed ───────────────────────────────────────────────────
function TwitterFeed({ handle }: { handle: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function load() {
      if (ref.current && (window as any).twttr?.widgets) {
        ;(window as any).twttr.widgets.load(ref.current)
      }
    }
    if ((window as any).twttr) { load(); return }
    if (document.querySelector('script[src*="widgets.js"]')) { setTimeout(load, 1000); return }
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

function SocialLinkDisabled({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: '#0f172a', border: '1px solid #1e293b',
      borderRadius: '8px', padding: '9px 12px',
      color: '#334155', fontSize: '13px', fontWeight: 600,
    }}>
      <span style={{ opacity: 0.2 }}>{icon}</span>
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#334155', fontStyle: 'italic' }}>Not yet</span>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function TempoDashboardPage() {
  const { address, isConnected } = useAccount()
  const [quizState, setQuizState] = useState<'dashboard' | 'playing' | 'result'>('dashboard')
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState<number[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [unlockedCount] = useState(getTempoUnlockedCount())

  const refUrl = `${APP_URL}?ref=${address?.slice(2, 10) ?? 'tempo'}&chain=tempo`

  const { data: progressData, refetch } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI, functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id, query: { enabled: !!address },
  })
  const { data: totalMinted } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI, functionName: 'totalMinted',
    chainId: tempoTestnet.id,
  })
  const { data: myBadges } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id, query: { enabled: !!address },
  })

  const progressArr = progressData ? [...progressData] : Array(TEMPO_QUIZZES.length).fill(false)
  const completedCount = progressArr.filter(Boolean).length
  const level = getUserLevel(completedCount)
  const nextLevelIdx = USER_LEVELS.findIndex(l => l.label === level.label) + 1
  const nextLevel = USER_LEVELS[nextLevelIdx]
  const levelPct = nextLevel ? Math.round(((completedCount - level.min) / (nextLevel.min - level.min)) * 100) : 100

  function copyRef() {
    navigator.clipboard.writeText(refUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  function shareOnX() {
    const text = `Just earned Soulbound NFT badges learning #Tempo blockchain! 🎵\nJoin me on @OnChainGM Quiz — learn & earn for free:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refUrl)}`, '_blank')
  }

  // ── Quiz screens ───────────────────────────────────────────────
  if (quizState === 'playing' && activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onPass={ans => { setCorrectAnswers(ans); setQuizState('result') }}
        onBack={() => { setQuizState('dashboard'); setActiveQuiz(null) }}
      />
    )
  }

  if (quizState === 'result' && activeQuiz && correctAnswers) {
    return (
      <MintBadge
        quiz={activeQuiz}
        answers={correctAnswers}
        onDone={() => { setQuizState('dashboard'); setActiveQuiz(null); setCorrectAnswers(null); refetch() }}
      />
    )
  }

  // ── Dashboard ──────────────────────────────────────────────────
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
            {address.slice(0, 6)}...{address.slice(-4)} · Tempo Moderato
          </span>
        )}
        {!isConnected && (
          <div style={{ background: '#f5c84222', border: '1px solid #f5c84266', color: '#f5c842', padding: '8px 14px', borderRadius: '10px', fontSize: '13px' }}>
            ⚠ Connect wallet to track progress
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: '🎓', value: `${completedCount}`, sub: `/ ${TEMPO_QUIZZES.length}`, label: 'Completed', color: '#a78bfa' },
          { icon: '🏅', value: myBadges?.toString() ?? '0', sub: '', label: 'My Badges', color: '#f59e0b' },
          { icon: '🌍', value: totalMinted?.toString() ?? '—', sub: '', label: 'Total Minted', color: '#10b981' },
          { icon: '🔓', value: `${unlockedCount}`, sub: `/ ${TEMPO_QUIZZES.length}`, label: 'Unlocked', color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'linear-gradient(135deg, #0d1424 60%, #111827)',
            border: `1px solid ${s.color}22`,
            borderTop: `2px solid ${s.color}55`,
            borderRadius: '14px', padding: '18px 14px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#f1f5f9', fontFamily: "'Inter', monospace", lineHeight: 1 }}>{s.value}</span>
              {s.sub && <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{s.sub}</span>}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div className="dash-2col">

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Level progress */}
          <div style={{ background: '#0d1424', border: `1px solid ${ACC}33`, borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{level.icon}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: level.color }}>{level.label}</div>
                  {nextLevel && <div style={{ fontSize: '12px', color: '#64748b' }}>Next: {nextLevel.icon} {nextLevel.label}</div>}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{completedCount}/{nextLevel ? nextLevel.min : TEMPO_QUIZZES.length}</span>
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

          {/* Badge grid */}
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px', paddingBottom: '10px', borderBottom: `1px solid ${ACC}33` }}>
              Tempo Badges · {completedCount}/{TEMPO_QUIZZES.length} earned
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {BADGE_TIERS.map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: t.color }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: t.color }} />
                  {t.label} ({t.maxId <= 5 ? '1–5' : t.maxId <= 10 ? '6–10' : t.maxId <= 15 ? '11–15' : '16–20'})
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
              {TEMPO_QUIZZES.map((quiz, i) => {
                const done = progressArr[i] as boolean
                const unlocked = i < unlockedCount
                const tier = getBadgeTier(quiz.id)
                const clickable = unlocked && !done
                return (
                  <div key={quiz.id}
                    onClick={clickable ? () => { setActiveQuiz(quiz); setQuizState('playing') } : undefined}
                    onMouseEnter={e => {
                      if (clickable) {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.transform = 'translateY(-4px)'
                        el.style.boxShadow = `0 0 28px ${tier.color}66, 0 0 10px ${tier.color}44, 0 8px 24px rgba(0,0,0,0.4)`
                        el.style.borderColor = tier.color
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = done ? 'none' : clickable ? `0 0 14px ${tier.color}33, 0 0 5px ${tier.color}22` : 'none'
                      el.style.borderColor = done ? tier.border : clickable ? tier.border : '#0f172a'
                    }}
                    style={{
                      background: done
                        ? `linear-gradient(135deg, ${tier.bg}, #0d1424)`
                        : clickable ? `linear-gradient(135deg, ${tier.bg}, #0d1424 70%)` : '#080d18',
                      border: `1px solid ${done ? tier.border : clickable ? tier.border : '#0f172a'}`,
                      borderRadius: '12px', padding: '14px 8px 12px', textAlign: 'center',
                      opacity: unlocked ? 1 : 0.25, position: 'relative',
                      cursor: clickable ? 'pointer' : 'default',
                      transition: 'all 0.25s ease',
                      boxShadow: clickable ? `0 0 14px ${tier.color}33, 0 0 5px ${tier.color}22` : 'none',
                    }}>
                    {done && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: tier.color, borderRadius: '0 12px 0 8px',
                        padding: '2px 6px', fontSize: '8px', fontWeight: 900, color: '#000', letterSpacing: '0.3px',
                      }}>{tier.label}</div>
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '6px', filter: !unlocked ? 'grayscale(1)' : 'none' }}>
                      {unlocked ? quiz.emoji : '🔒'}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: done ? '#e2e8f0' : unlocked ? '#94a3b8' : '#334155', lineHeight: 1.3, marginBottom: '6px' }}>{quiz.title}</div>
                    {done && (
                      <div style={{ fontSize: '10px', color: tier.color, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <span>✓</span><span>SBT #{quiz.id}</span>
                      </div>
                    )}
                    {clickable && (
                      <div style={{ fontSize: '10px', color: ACC, fontWeight: 700, background: `${ACC}15`, borderRadius: '999px', padding: '2px 8px', display: 'inline-block' }}>
                        ▶ Start
                      </div>
                    )}
                    {!unlocked && (
                      <div style={{ fontSize: '9px', color: '#334155', fontWeight: 600 }}>Locked</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* RIGHT — Referral + Project Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Referral */}
          {isConnected && (
            <div style={{ background: '#0d1424', border: `1px solid ${ACC}33`, borderRadius: '16px', padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>🔗 Referral Link</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>Invite friends — earn Soulbound badges together</p>
              <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
                <div style={{ flex: 1, background: '#131c2e', border: `1px solid ${ACC}22`, borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {refUrl}
                </div>
                <button onClick={copyRef} style={{
                  background: copied ? '#10b98120' : '#1e293b', border: `1px solid ${copied ? '#10b981' : ACC + '44'}`,
                  borderRadius: '8px', color: copied ? '#10b981' : ACC,
                  cursor: 'pointer', fontWeight: 700, fontSize: '11px', padding: '8px 14px', whiteSpace: 'nowrap',
                }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button onClick={shareOnX} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                width: '100%', background: '#000', border: '1px solid #222',
                borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '10px',
              }}>
                <XIcon /> Share on X
              </button>
            </div>
          )}

          <div style={{ background: '#0d1424', border: `1px solid ${ACC}33`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🎵</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: ACC }}>Tempo Testnet</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Moderato · Chain ID 42431</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SocialLink icon={<XIcon />}    label="@tempo"            url="https://x.com/tempo"               color="#fff" />
              <SocialLinkDisabled icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.083.115 18.108.132 18.124a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>} label="Discord" />
              <SocialLinkDisabled icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>} label="Telegram" />
              <SocialLink icon={<GlobeIcon />} label="tempo.xyz"          url="https://tempo.xyz"                 color={ACC} />
              <SocialLink icon={<GlobeIcon />} label="explore.tempo.xyz"  url="https://explore.tempo.xyz"         color="#64748b" />
              <SocialLink icon={<GlobeIcon />} label="Faucet"             url="https://docs.tempo.xyz/quickstart/faucet" color="#10b981" />
            </div>
          </div>

          <div style={{ background: '#0d1424', border: `1px solid ${ACC}22`, borderRadius: '16px', padding: '18px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Network Info</div>
            {[['Chain ID','42431'],['Network','Moderato'],['Gas Token','AlphaUSD'],['RPC','rpc.moderato.tempo.xyz'],['Explorer','explore.tempo.xyz']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #0f172a', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{k}</span>
                <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#0d1424', border: `1px solid ${ACC}22`, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${ACC}22`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XIcon />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Latest from @tempo</span>
              <a href="https://x.com/tempo" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontSize: '11px', color: ACC, textDecoration: 'none' }}>View all →</a>
            </div>
            <TwitterFeed handle="tempo" />
          </div>

        </div>
      </div>
    </div>
  )
}
