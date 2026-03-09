import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { TEMPO_QUIZZES, TEMPO_QUIZ_ABI, getUnlockedCount, formatUnlockDate, type QuizData } from './TempoQuizData'
import { tempoTestnet } from '../wagmi'

const TEMPO_QUIZ_CONTRACT = (import.meta.env['VITE_TEMPO_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

type QuizState = 'list' | 'playing' | 'result'

function BadgeCard({
  quizId,
  completed,
  unlocked,
  unlockDate,
  onClick,
}: {
  quizId: number
  completed: boolean
  unlocked: boolean
  unlockDate: string
  onClick: () => void
}) {
  const quiz = TEMPO_QUIZZES[quizId - 1]

  return (
    <div
      onClick={unlocked && !completed ? onClick : undefined}
      style={{
        background: '#0d1424',
        border: `1px solid ${completed ? '#8b5cf6' : unlocked ? '#334155' : '#1e293b'}`,
        borderRadius: '14px',
        padding: '20px 14px',
        textAlign: 'center',
        cursor: unlocked && !completed ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.45,
        transition: 'transform 0.2s, border-color 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (unlocked && !completed) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Lock overlay for future quizzes */}
      {!unlocked && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: '#1e293b', borderRadius: '6px',
          padding: '2px 6px', fontSize: '10px', color: '#64748b', fontWeight: 700,
        }}>
          {unlockDate}
        </div>
      )}

      <div style={{ fontSize: '28px', marginBottom: '8px' }}>
        {completed ? quiz.emoji : unlocked ? quiz.emoji : '🔒'}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.3 }}>
        {quiz.title}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600 }}>
        {completed
          ? <span style={{ color: '#8b5cf6' }}>✓ Earned</span>
          : unlocked
          ? <span style={{ color: '#64748b' }}>▶ Start</span>
          : <span style={{ color: '#475569' }}>Unlocks {unlockDate}</span>}
      </div>
    </div>
  )
}

function QuizPlayer({ quiz, onPass, onFail, onBack }: {
  quiz: QuizData
  onPass: (ans: [number, number, number]) => void
  onFail: () => void
  onBack: () => void
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const question = quiz.questions[step]

  function handleConfirm() {
    if (selected === null) return
    setRevealed(true)
  }

  function handleNext() {
    if (selected === null) return
    if (selected !== question.correctIndex) { onFail(); return }
    const newAnswers = [...answers, selected]
    if (step === 2) {
      onPass(newAnswers as [number, number, number])
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
        <span className="step-indicator">Question {step + 1} / 3</span>
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
          : <button className="confirm-btn tempo" onClick={handleNext}>
              {selected === question.correctIndex ? (step < 2 ? 'Next →' : 'Finish 🎉') : 'Try Again'}
            </button>
        }
      </div>
    </div>
  )
}

export default function TempoQuizPage() {
  const { address } = useAccount()
  const [state, setState] = useState<QuizState>('list')
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [pendingAnswers, setPendingAnswers] = useState<[number, number, number] | null>(null)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [unlockedCount, setUnlockedCount] = useState(getUnlockedCount())

  // Re-check unlock count every minute (in case a new quiz unlocks while page is open)
  useEffect(() => {
    const timer = setInterval(() => setUnlockedCount(getUnlockedCount()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const { data: progressData, refetch: refetchProgress } = useReadContract({
    address: TEMPO_QUIZ_CONTRACT,
    abi: TEMPO_QUIZ_ABI,
    functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    chainId: tempoTestnet.id,
    query: { enabled: !!address },
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

  const { writeContract, data: txHash, isPending: isSigning } = useWriteContract()
  const { isLoading: isMining, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (isTxSuccess) {
      setMintSuccess(true)
      setPendingAnswers(null)
      refetchProgress()
    }
  }, [isTxSuccess])

  function handlePass(answers: [number, number, number]) {
    setPendingAnswers(answers)
    setState('result')
    setMintSuccess(false)
  }

  function handleMint() {
    if (!activeQuiz || !pendingAnswers) return
    writeContract({
      address: TEMPO_QUIZ_CONTRACT,
      abi: TEMPO_QUIZ_ABI,
      functionName: 'submitQuiz',
      args: [BigInt(activeQuiz.id), pendingAnswers[0], pendingAnswers[1], pendingAnswers[2]],
      chainId: tempoTestnet.id,
    })
  }

  return (
    <div className="quiz-page">
      {state === 'list' && (
        <>
          <div className="quiz-page-header">
            <h1>🎵 Tempo Quiz</h1>
            <p className="subtitle">
              {address
                ? `${completedCount}/${unlockedCount} completed · My Badges: ${myBadges?.toString() ?? '0'} · ${20 - unlockedCount} coming soon`
                : 'Connect wallet to start'}
            </p>
          </div>

          {/* Unlocked section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              🔓 Available Now ({unlockedCount} quizzes)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '14px',
            }}>
              {TEMPO_QUIZZES.slice(0, unlockedCount).map(quiz => (
                <BadgeCard
                  key={quiz.id}
                  quizId={quiz.id}
                  completed={progress[quiz.id - 1]}
                  unlocked={true}
                  unlockDate={formatUnlockDate(quiz.id)}
                  onClick={() => {
                    setActiveQuiz(quiz)
                    setState('playing')
                    setMintSuccess(false)
                    setPendingAnswers(null)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Locked section */}
          {unlockedCount < 20 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                🔒 Coming Soon ({20 - unlockedCount} quizzes)
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '14px',
              }}>
                {TEMPO_QUIZZES.slice(unlockedCount).map(quiz => (
                  <BadgeCard
                    key={quiz.id}
                    quizId={quiz.id}
                    completed={false}
                    unlocked={false}
                    unlockDate={formatUnlockDate(quiz.id)}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {state === 'playing' && activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onPass={handlePass}
          onFail={() => setState('list')}
          onBack={() => setState('list')}
        />
      )}

      {state === 'result' && activeQuiz && (
        <div className="result-screen">
          {mintSuccess ? (
            <>
              <div style={{ fontSize: '64px' }}>🎉</div>
              <h2>Badge Minted!</h2>
              <p style={{ color: '#8b5cf6' }}>
                You earned the <strong>{activeQuiz.emoji} {activeQuiz.title}</strong> Soulbound badge on Tempo!
              </p>
              <button className="mint-btn tempo" onClick={() => setState('list')}>← Back to Quizzes</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px' }}>✅</div>
              <h2>All Correct!</h2>
              <p>Mint your <strong>{activeQuiz.emoji} {activeQuiz.title}</strong> Soulbound badge on Tempo</p>
              <button className="mint-btn tempo" onClick={handleMint} disabled={isSigning || isMining}>
                {isSigning ? 'Confirm in wallet...' : isMining ? 'Minting...' : '🎵 Mint Tempo Badge'}
              </button>
              <button className="back-btn" style={{ marginTop: '12px' }} onClick={() => setState('list')}>Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
