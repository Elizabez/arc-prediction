import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { QUIZZES, ARC_QUIZ_ABI, type QuizData } from './QuizData'
import { arcTestnet } from '../wagmi'

// UPDATE THIS after deploying ArcQuiz.sol
const QUIZ_CONTRACT = (import.meta.env['VITE_QUIZ_CONTRACT'] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

type QuizState = 'list' | 'playing' | 'result'

function BadgeCard({ quizId, completed }: { quizId: number; completed: boolean }) {
  const quiz = QUIZZES[quizId - 1]
  return (
    <div className={`badge-card ${completed ? 'completed' : 'locked'}`}>
      <div className="badge-emoji">{quiz.emoji}</div>
      <div className="badge-title">{quiz.title}</div>
      {completed
        ? <div className="badge-status done">✓ Completed</div>
        : <div className="badge-status pending">🔒 Locked</div>
      }
    </div>
  )
}

function QuizPlayer({
  quiz,
  onPass,
  onFail,
  onBack,
}: {
  quiz: QuizData
  onPass: (ans: [number, number, number]) => void
  onFail: () => void
  onBack: () => void
}) {
  const [step, setStep] = useState(0)         // 0,1,2 = question index
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const question = quiz.questions[step]

  function handleSelect(idx: number) {
    if (revealed) return
    setSelected(idx)
  }

  function handleConfirm() {
    if (selected === null) return
    setRevealed(true)
  }

  function handleNext() {
    const newAnswers = [...answers, selected!]
    if (step < 2) {
      setAnswers(newAnswers)
      setStep(step + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      // Check all answers
      const allCorrect = newAnswers.every(
        (ans, i) => ans === quiz.questions[i].correctIndex
      )
      if (allCorrect) {
        onPass(newAnswers as [number, number, number])
      } else {
        onFail()
      }
    }
  }

  const isCorrect = revealed && selected === question.correctIndex

  return (
    <div className="quiz-player">
      <button className="quiz-back" onClick={onBack}>← Back</button>

      <div className="quiz-header">
        <span className="quiz-emoji">{quiz.emoji}</span>
        <h2>{quiz.title}</h2>
        <div className="quiz-progress">
          {[0, 1, 2].map(i => (
            <div key={i} className={`progress-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="quiz-question">
        <div className="question-num">Question {step + 1} / 3</div>
        <div className="question-text">{question.question}</div>
      </div>

      <div className="quiz-options">
        {question.options.map((opt, idx) => {
          let cls = 'quiz-option'
          if (revealed) {
            if (idx === question.correctIndex) cls += ' correct'
            else if (idx === selected) cls += ' wrong'
          } else if (idx === selected) {
            cls += ' selected'
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <span className="option-letter">{['A', 'B', 'C', 'D'][idx]}</span>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {!revealed && (
        <button className="btn-confirm" onClick={handleConfirm} disabled={selected === null}>
          Confirm Answer
        </button>
      )}

      {revealed && (
        <div className="reveal-feedback">
          <div className={`feedback-msg ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Wrong! Correct: ${question.options[question.correctIndex]}`}
          </div>
          <button className="btn-next" onClick={handleNext}>
            {step < 2 ? 'Next Question →' : 'See Result →'}
          </button>
        </div>
      )}
    </div>
  )
}

function MintBadge({ quiz, answers, onDone }: {
  quiz: QuizData
  answers: [number, number, number]
  onDone: () => void
}) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  function handleMint() {
    writeContract({
      address: QUIZ_CONTRACT,
      abi: ARC_QUIZ_ABI,
      functionName: 'submitQuiz',
      args: [BigInt(quiz.id), answers[0], answers[1], answers[2]],
      chainId: arcTestnet.id,
      gas: BigInt(500000),
      gasPrice: BigInt(20000000000),
    })
  }

  return (
    <div className="mint-screen">
      <div className="mint-emoji">🎉</div>
      <h2 className="mint-title">Perfect Score!</h2>
      <p className="mint-sub">You answered all 3 questions correctly in <strong>{quiz.title}</strong>!</p>

      <div className="mint-badge-preview">
        <div className="badge-preview-emoji">{quiz.emoji}</div>
        <div className="badge-preview-name">Arc Quiz Badge #{quiz.id}</div>
        <div className="badge-preview-sub">Soulbound NFT · Non-transferable</div>
      </div>

      {!isSuccess && (
        <button className="btn-mint" onClick={handleMint} disabled={isPending || isConfirming}>
          {isPending ? 'Confirm in wallet…' : isConfirming ? 'Minting on-chain…' : '⛏ Mint Badge On-Chain'}
        </button>
      )}

      {error && (
        <div className="mint-error">Error: {error.message.slice(0, 80)}</div>
      )}

      {isSuccess && (
        <div className="mint-success">
          <div className="success-icon">✓</div>
          <div>Badge minted on Arc Testnet!</div>
          {hash && (
            <a href={`https://testnet.arcscan.app/tx/${hash}`} target="_blank" rel="noreferrer" className="tx-link">
              View transaction →
            </a>
          )}
          <button className="btn-done" onClick={onDone}>Back to Quizzes</button>
        </div>
      )}
    </div>
  )
}

function FailScreen({ quiz, onRetry, onBack }: { quiz: QuizData; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="fail-screen">
      <div className="fail-emoji">😔</div>
      <h2>Not quite right!</h2>
      <p>You need to answer <strong>all 3 questions correctly</strong> to mint the badge.</p>
      <div className="fail-buttons">
        <button className="btn-retry" onClick={onRetry}>🔄 Try Again</button>
        <button className="btn-back-quiz" onClick={onBack}>← Back to List</button>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const { address, isConnected } = useAccount()
  const [state, setState] = useState<QuizState>('list')
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState<[number, number, number] | null>(null)
  const [failed, setFailed] = useState(false)

  // Get user progress from contract
  const { data: progress, refetch } = useReadContract({
    address: QUIZ_CONTRACT,
    abi: ARC_QUIZ_ABI,
    functionName: 'getUserProgress',
    args: address ? [address] : undefined,
    query: { enabled: !!address && QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
    chainId: arcTestnet.id,
      gas: BigInt(500000),
      gasPrice: BigInt(20000000000),
  })

  const { data: totalMinted } = useReadContract({
    address: QUIZ_CONTRACT,
    abi: ARC_QUIZ_ABI,
    functionName: 'totalMinted',
    chainId: arcTestnet.id,
      gas: BigInt(500000),
      gasPrice: BigInt(20000000000),
    query: { enabled: QUIZ_CONTRACT !== '0x0000000000000000000000000000000000000000' },
  })

  const progressArr = progress as boolean[] | undefined
  const completedCount = progressArr ? progressArr.filter(Boolean).length : 0

  function startQuiz(quiz: QuizData) {
    setActiveQuiz(quiz)
    setFailed(false)
    setState('playing')
  }

  function handlePass(ans: [number, number, number]) {
    setCorrectAnswers(ans)
    setState('result')
  }

  function handleFail() {
    setFailed(true)
    setState('result')
  }

  function handleDone() {
    setState('list')
    setActiveQuiz(null)
    refetch()
  }

  return (
    <div className="quiz-page">
      {state === 'list' && (
        <>
          <div className="quiz-page-header">
            <h1>🧠 Arc Knowledge Quiz</h1>
            <p>Test your knowledge about Arc blockchain. Answer all 3 questions correctly to mint a Soulbound NFT badge!</p>
            <div className="quiz-stats">
              <div className="qstat">
                <span className="qstat-val">{completedCount}/10</span>
                <span className="qstat-label">Completed</span>
              </div>
              <div className="qstat-divider" />
              <div className="qstat">
                <span className="qstat-val">{totalMinted?.toString() ?? '—'}</span>
                <span className="qstat-label">Badges Minted</span>
              </div>
              <div className="qstat-divider" />
              <div className="qstat">
                <span className="qstat-val">SBT</span>
                <span className="qstat-label">Non-transferable</span>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="quiz-connect-warning">
              ⚠ Connect your wallet to track progress and mint badges
            </div>
          )}

          <div className="quiz-grid">
            {QUIZZES.map(quiz => {
              const completed = progressArr ? progressArr[quiz.id - 1] : false
              return (
                <div
                  key={quiz.id}
                  className={`quiz-card ${completed ? 'completed' : ''}`}
                  onClick={() => !completed && startQuiz(quiz)}
                >
                  <div className="quiz-card-num">#{quiz.id}</div>
                  <div className="quiz-card-emoji">{quiz.emoji}</div>
                  <div className="quiz-card-title">{quiz.title}</div>
                  <div className="quiz-card-meta">3 questions · SBT reward</div>
                  {completed
                    ? <div className="quiz-card-badge">✓ Badge Earned</div>
                    : <div className="quiz-card-cta">Start Quiz →</div>
                  }
                </div>
              )
            })}
          </div>
        </>
      )}

      {state === 'playing' && activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onPass={handlePass}
          onFail={handleFail}
          onBack={() => setState('list')}
        />
      )}

      {state === 'result' && activeQuiz && !failed && correctAnswers && (
        <MintBadge quiz={activeQuiz} answers={correctAnswers} onDone={handleDone} />
      )}

      {state === 'result' && activeQuiz && failed && (
        <FailScreen
          quiz={activeQuiz}
          onRetry={() => startQuiz(activeQuiz)}
          onBack={() => setState('list')}
        />
      )}
    </div>
  )
}
