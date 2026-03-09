import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { TEMPO_QUIZZES, TEMPO_QUIZ_ABI, getTempoUnlockedCount, formatTempoUnlockDate, type QuizData } from './TempoQuizData'
import { tempoTestnet } from '../wagmi'

const TEMPO_QUIZ_CONTRACT = (import.meta.env['VITE_TEMPO_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

type QuizState = 'list' | 'playing' | 'result'

function BadgeCard({ quiz, completed, unlocked, onClick }: {
  quiz: QuizData; completed: boolean; unlocked: boolean; onClick: () => void
}) {
  const unlockDate = formatTempoUnlockDate(quiz.id)
  return (
    <div
      onClick={unlocked && !completed ? onClick : undefined}
      style={{
        background: '#0d1424',
        border: `1px solid ${completed ? '#8b5cf6' : unlocked ? '#334155' : '#1e293b'}`,
        borderRadius: '14px', padding: '20px 14px', textAlign: 'center',
        cursor: unlocked && !completed ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.45,
        transition: 'transform 0.2s, border-color 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (unlocked && !completed) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {!unlocked && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#1e293b', borderRadius: '6px', padding: '2px 6px', fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
          {unlockDate}
        </div>
      )}
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{completed ? quiz.emoji : unlocked ? quiz.emoji : '🔒'}</div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>{quiz.title}</div>
      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>{quiz.questions.length} questions</div>
      <div style={{ fontSize: '11px', fontWeight: 600 }}>
        {completed ? <span style={{ color: '#8b5cf6' }}>✓ Earned</span>
          : unlocked ? <span style={{ color: '#64748b' }}>▶ Start</span>
          : <span style={{ color: '#475569' }}>Unlocks {unlockDate}</span>}
      </div>
    </div>
  )
}

function QuizPlayer({ quiz, onPass, onBack }: {
  quiz: QuizData
  onPass: (answers: number[]) => void
  onBack: () => void
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const question = quiz.questions[step]
  const isLast = step === quiz.questions.length - 1
  const isCorrect = revealed && selected === question.correctIndex

  function handleConfirm() {
    if (selected === null) return
    setRevealed(true)
  }

  function handleNext() {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    if (selected !== question.correctIndex) {
      setStep(0); setAnswers([]); setSelected(null); setRevealed(false)
      return
    }
    if (isLast) {
      onPass(newAnswers)
    } else {
      setAnswers(newAnswers)
      setStep(step + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  return (
    <div className="quiz-player">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="quiz-header">
        <span className="quiz-emoji">{quiz.emoji}</span>
        <h2>{quiz.title}</h2>
        <span className="step-indicator">Question {step + 1} / {quiz.questions.length}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
        {quiz.questions.map((_, i) => (
          <div key={i} style={{
            width: '28px', height: '4px', borderRadius: '2px',
            background: i < step ? '#8b5cf6' : i === step ? '#a78bfa' : '#1e293b',
          }} />
        ))}
      </div>
      <div className="question-box">
        <p className="question-text">{question.question}</p>
        <div className="options-grid">
          {question.options.map((opt, i) => {
            let cls = 'option-btn'
            if (revealed) {
              if (i === question.correctIndex) cls += ' correct'
              else if (i === selected) cls += ' wrong'
            } else if (i === selected) cls += ' selected'
            return (
              <button key={i} className={cls} onClick={() => !revealed && setSelected(i)}>
                <span className="option-letter">{['A', 'B', 'C', 'D'][i]}</span>
                {opt}
              </button>
            )
          })}
        </div>
        {!revealed
          ? <button className="confirm-btn tempo" onClick={handleConfirm} disabled={selected === null}>Confirm</button>
          : (
            <div>
              <div style={{ marginBottom: '12px', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 600, background: isCorrect ? '#052e16' : '#2d0a0a', color: isCorrect ? '#4ade80' : '#f87171' }}>
                {isCorrect ? '✓ Correct!' : `✗ Wrong! Correct: ${question.options[question.correctIndex]}`}
              </div>
              <button className="confirm-btn tempo" onClick={handleNext}>
                {isCorrect ? (isLast ? 'Mint Badge 🎉' : 'Next →') : '↺ Restart'}
              </button>
            </div>
          )
        }
      </div>
    </div>
  )
}

function MintBadge({ quiz, answers, onDone }: { quiz: QuizData; answers: number[]; onDone: () => void }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  function handleMint() {
    writeContract({
      address: TEMPO_QUIZ_CONTRACT,
      abi: TEMPO_QUIZ_ABI,
      functionName: 'submitQuiz',
      args: [BigInt(quiz.id), answers.map(a => a as number)],
      chainId: tempoTestnet.id,
    })
  }

  return (
    <div className="mint-screen">
      <div style={{ fontSize: '64px', textAlign: 'center' }}>🎉</div>
      <h2 style={{ textAlign: 'center' }}>All Correct!</h2>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>
        Mint your <strong>{quiz.emoji} {quiz.title}</strong> Soulbound badge on Tempo!
      </p>
      <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: '#0d1424', border: '1px solid #334155', borderRadius: '14px' }}>
        <div style={{ fontSize: '48px' }}>{quiz.emoji}</div>
        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Tempo Quiz Badge #{quiz.id}</div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>Soulbound NFT · Non-transferable</div>
      </div>
      {!isSuccess && (
        <button className="mint-btn tempo" onClick={handleMint} disabled={isPending || isConfirming} style={{ width: '100%' }}>
          {isPending ? 'Confirm in wallet…' : isConfirming ? 'Minting…' : '🎵 Mint Tempo Badge'}
        </button>
      )}
      {error && (
        <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', padding: '10px', background: '#1e293b', borderRadius: '8px' }}>
          Error: {error.message.slice(0, 120)}
        </div>
      )}
      {isSuccess && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '32px' }}>✅</div>
          <div style={{ color: '#8b5cf6', fontWeight: 700 }}>Badge minted on Tempo!</div>
          {hash && (
            <a href={`https://explore.tempo.xyz/tx/${hash}`} target="_blank" rel="noreferrer"
              style={{ color: '#a78bfa', fontSize: '13px', display: 'block', marginTop: '8px' }}>
              View transaction →
            </a>
          )}
          <button className="mint-btn tempo" onClick={onDone} style={{ marginTop: '16px', width: '100%' }}>← Back to Quizzes</button>
        </div>
      )}
    </div>
  )
}

export default function TempoQuizPage() {
  const { address } = useAccount()
  const [state, setState] = useState<QuizState>('list')
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState<number[] | null>(null)
  const [unlockedCount, setUnlockedCount] = useState(getTempoUnlockedCount())

  useEffect(() => {
    const t = setInterval(() => setUnlockedCount(getTempoUnlockedCount()), 60_000)
    return () => clearInterval(t)
  }, [])

  const { data: progressData, refetch } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI, functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id,
    query: { enabled: !!address },
  })

  const { data: myBadges } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT, abi: TEMPO_QUIZ_ABI, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id,
    query: { enabled: !!address },
  })

  const progress = progressData ? [...progressData] : Array(TEMPO_QUIZZES.length).fill(false)
  const completedCount = progress.filter(Boolean).length

  function handleDone() {
    setState('list'); setActiveQuiz(null); setCorrectAnswers(null); refetch()
  }

  return (
    <div className="quiz-page">
      {state === 'list' && (
        <>
          <div className="quiz-page-header">
            <h1>🎵 Tempo Quiz</h1>
            <p className="subtitle">
              {address
                ? `${completedCount}/${unlockedCount} completed · Badges: ${myBadges?.toString() ?? '0'} · ${TEMPO_QUIZZES.length - unlockedCount} coming soon`
                : 'Connect wallet to start'}
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              🔓 Available Now ({unlockedCount} quizzes)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
              {TEMPO_QUIZZES.slice(0, unlockedCount).map(quiz => (
                <BadgeCard key={quiz.id} quiz={quiz} completed={progress[quiz.id - 1]} unlocked={true}
                  onClick={() => { setActiveQuiz(quiz); setState('playing'); setCorrectAnswers(null) }} />
              ))}
            </div>
          </div>

          {unlockedCount < TEMPO_QUIZZES.length && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                🔒 Coming Soon ({TEMPO_QUIZZES.length - unlockedCount} quizzes)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
                {TEMPO_QUIZZES.slice(unlockedCount).map(quiz => (
                  <BadgeCard key={quiz.id} quiz={quiz} completed={false} unlocked={false} onClick={() => {}} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {state === 'playing' && activeQuiz && (
        <QuizPlayer quiz={activeQuiz} onPass={ans => { setCorrectAnswers(ans); setState('result') }} onBack={() => setState('list')} />
      )}

      {state === 'result' && activeQuiz && correctAnswers && (
        <MintBadge quiz={activeQuiz} answers={correctAnswers} onDone={handleDone} />
      )}
    </div>
  )
}
