import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http } from 'viem'
import { arcTestnet, tempoTestnet, robinhoodTestnet } from '../wagmi'
import { ARC_QUIZZES } from './ArcQuizData'
import { TEMPO_QUIZZES } from './TempoQuizData'
import { ROBINHOOD_QUIZZES } from './RobinhoodQuizData'

// ── Contract addresses ─────────────────────────────────────────────
const ARC_CONTRACT   = '0x15a9C1Ff1F9ECBC7CF93b2F22bF620B811932466' as `0x${string}`
const TEMPO_CONTRACT = '0x0007473c10FCf7b56C349f30fc13b1717397f08C' as `0x${string}`
const RH_CONTRACT    = '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10' as `0x${string}`

// ── Viem clients ───────────────────────────────────────────────────
const arcClient   = createPublicClient({ chain: arcTestnet,       transport: http() })
const tempoClient = createPublicClient({ chain: tempoTestnet,     transport: http() })
const rhClient    = createPublicClient({ chain: robinhoodTestnet, transport: http() })

// ── Inline ABI ─────────────────────────────────────────────────────
const GET_PROGRESS_ABI = [
  {
    type: 'function',
    name: 'getUserProgress',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool[]' }],
  },
] as const

// ── Types ──────────────────────────────────────────────────────────
interface ChainProgress {
  progress: boolean[]
  earned: number
}

interface ProfileData {
  arc: ChainProgress
  tempo: ChainProgress
  robinhood: ChainProgress
  total: number
}

// ── Chain config ───────────────────────────────────────────────────
const CHAIN_CONFIG = [
  {
    key: 'arc' as const,
    name: 'Arc Testnet',
    emoji: '◈',
    color: '#3b82f6',
    contract: ARC_CONTRACT,
    client: arcClient,
    quizzes: ARC_QUIZZES,
  },
  {
    key: 'tempo' as const,
    name: 'Tempo Testnet',
    emoji: '🎵',
    color: '#8b5cf6',
    contract: TEMPO_CONTRACT,
    client: tempoClient,
    quizzes: TEMPO_QUIZZES,
  },
  {
    key: 'robinhood' as const,
    name: 'Robinhood Chain',
    emoji: '🔴',
    color: '#22c55e',
    contract: RH_CONTRACT,
    client: rhClient,
    quizzes: ROBINHOOD_QUIZZES,
  },
]

// ── Tier helper ────────────────────────────────────────────────────
function getTier(quizId: number, chainColor: string): { label: string; color: string } {
  if (quizId >= 16) return { label: 'Diamond', color: chainColor }
  if (quizId >= 11) return { label: 'Gold',    color: '#f59e0b' }
  if (quizId >= 6)  return { label: 'Silver',  color: '#94a3b8' }
  return                     { label: 'Bronze', color: '#cd7f32' }
}

// ── Address formatting ─────────────────────────────────────────────
function fmtAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// ── Props ──────────────────────────────────────────────────────────
interface ProfilePageProps {
  profileAddress: string
  connectedAddress?: string
  onBack?: () => void
}

// ── Component ──────────────────────────────────────────────────────
export default function ProfilePage({ profileAddress, connectedAddress, onBack }: ProfilePageProps) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sharecopied, setShareCopied] = useState(false)

  const isMe = connectedAddress
    ? connectedAddress.toLowerCase() === profileAddress.toLowerCase()
    : false

  const fetchProgress = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const addr = profileAddress as `0x${string}`

      const [arcResult, tempoResult, rhResult] = await Promise.all([
        arcClient.readContract({
          address: ARC_CONTRACT,
          abi: GET_PROGRESS_ABI,
          functionName: 'getUserProgress',
          args: [addr],
        }).catch(() => [] as boolean[]),
        tempoClient.readContract({
          address: TEMPO_CONTRACT,
          abi: GET_PROGRESS_ABI,
          functionName: 'getUserProgress',
          args: [addr],
        }).catch(() => [] as boolean[]),
        rhClient.readContract({
          address: RH_CONTRACT,
          abi: GET_PROGRESS_ABI,
          functionName: 'getUserProgress',
          args: [addr],
        }).catch(() => [] as boolean[]),
      ])

      const arcProgress   = Array.from(arcResult   as boolean[])
      const tempoProgress = Array.from(tempoResult as boolean[])
      const rhProgress    = Array.from(rhResult    as boolean[])

      const arcEarned  = arcProgress.filter(Boolean).length
      const tempoEarned = tempoProgress.filter(Boolean).length
      const rhEarned   = rhProgress.filter(Boolean).length

      setData({
        arc:      { progress: arcProgress,   earned: arcEarned  },
        tempo:    { progress: tempoProgress, earned: tempoEarned },
        robinhood:{ progress: rhProgress,    earned: rhEarned   },
        total: arcEarned + tempoEarned + rhEarned,
      })
    } catch (e) {
      setError('Failed to load profile data. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [profileAddress])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(profileAddress).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShare = () => {
    const url = `https://www.testnetquiz.xyz/?profile=${profileAddress}`
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px 80px', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: '8px', color: '#94a3b8',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px',
            padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all 0.15s',
          }}>
            ← Back
          </button>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, #${profileAddress.slice(2, 8)}, #${profileAddress.slice(-6)})`,
            border: '2px solid #1e293b',
          }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', letterSpacing: '-0.3px' }}>
                {fmtAddr(profileAddress)}
              </span>
              {isMe && (
                <span style={{
                  fontSize: '10px', fontWeight: 800, color: '#3b82f6',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '999px', padding: '2px 8px', letterSpacing: '0.05em',
                }}>
                  This is you
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>
              {profileAddress}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={handleCopyAddress} style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: '8px', color: copied ? '#22c55e' : '#94a3b8',
            cursor: 'pointer', fontWeight: 700, fontSize: '12px',
            padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all 0.15s',
          }}>
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
          <button onClick={handleShare} style={{
            background: sharecopied ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
            border: `1px solid ${sharecopied ? '#22c55e55' : '#3b82f655'}`,
            borderRadius: '8px', color: sharecopied ? '#22c55e' : '#93c5fd',
            cursor: 'pointer', fontWeight: 700, fontSize: '12px',
            padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all 0.15s',
          }}>
            {sharecopied ? '✓ Link copied!' : '↗ Share'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#475569' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading profile…</div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#334155' }}>
            Querying Arc · Tempo · Robinhood
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{
          padding: '40px', textAlign: 'center',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '16px', color: '#f87171',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{error}</div>
          <button onClick={fetchProgress} style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', color: '#f87171',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '8px 16px',
          }}>
            Retry
          </button>
        </div>
      )}

      {/* Profile data */}
      {!loading && !error && data && (
        <>
          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {[
              { label: 'Total Badges', value: data.total, color: '#f1f5f9', bg: '#1e293b' },
              { label: 'Arc Badges',   value: data.arc.earned,       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
              { label: 'Tempo Badges', value: data.tempo.earned,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
              { label: 'RH Badges',   value: data.robinhood.earned, color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg,
                border: `1px solid ${stat.color}22`,
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Chain sections */}
          {CHAIN_CONFIG.map(chain => {
            const chainData = data[chain.key]
            const progress = chainData.progress
            const earned   = chainData.earned
            const total    = chain.quizzes.length

            // Pad to 16 if shorter
            const padded = Array.from({ length: 16 }, (_, i) => progress[i] ?? false)

            return (
              <div key={chain.key} style={{
                background: '#0d1424',
                border: `1px solid #1e293b`,
                borderRadius: '18px',
                marginBottom: '20px',
                overflow: 'hidden',
              }}>
                {/* Chain header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #1e293b',
                  background: `linear-gradient(90deg, ${chain.color}10 0%, transparent 100%)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '20px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${chain.color}18`, borderRadius: '9px', color: chain.color,
                    }}>
                      {chain.emoji}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#f1f5f9' }}>
                        {chain.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                        {earned} / {total} badges earned
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '140px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Progress</span>
                      <span style={{ fontSize: '10px', color: chain.color, fontWeight: 700 }}>
                        {total > 0 ? Math.round((earned / total) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px', borderRadius: '999px',
                      background: '#1e293b', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${total > 0 ? (earned / total) * 100 : 0}%`,
                        background: `linear-gradient(90deg, ${chain.color}, ${chain.color}cc)`,
                        borderRadius: '999px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Badge grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '10px',
                  padding: '16px',
                }}>
                  {Array.from({ length: 16 }, (_, i) => {
                    const quiz    = chain.quizzes[i]
                    const isEarned = padded[i]
                    const quizId  = quiz ? quiz.id : i + 1
                    const tier    = getTier(quizId, chain.color)

                    return (
                      <div key={i} style={{
                        background: isEarned
                          ? `linear-gradient(135deg, ${chain.color}12, ${chain.color}06)`
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isEarned ? chain.color + '40' : '#1e293b'}`,
                        borderRadius: '12px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        opacity: isEarned ? 1 : 0.4,
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Tier ribbon */}
                        {isEarned && (
                          <div style={{
                            position: 'absolute', top: '5px', right: '5px',
                            fontSize: '8px', fontWeight: 800,
                            color: tier.color,
                            background: `${tier.color}20`,
                            borderRadius: '4px', padding: '1px 4px',
                            letterSpacing: '0.05em',
                          }}>
                            {tier.label.toUpperCase()}
                          </div>
                        )}

                        {/* Emoji */}
                        <div style={{ fontSize: '22px', marginBottom: '5px', filter: isEarned ? 'none' : 'grayscale(1)' }}>
                          {quiz ? quiz.emoji : '?'}
                        </div>

                        {/* Title */}
                        <div style={{
                          fontSize: '10px', fontWeight: 700,
                          color: isEarned ? '#e2e8f0' : '#475569',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        } as React.CSSProperties}>
                          {quiz ? quiz.title : `Quiz ${quizId}`}
                        </div>

                        {/* Quiz number */}
                        <div style={{ fontSize: '9px', color: '#334155', marginTop: '3px' }}>
                          #{quizId}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
