import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { useAccount } from 'wagmi'
import { arcTestnet, tempoTestnet, robinhoodTestnet } from '../wagmi'

// ── Contract addresses ─────────────────────────────────────────────
const ARC_CONTRACT   = '0x15a9C1Ff1F9ECBC7CF93b2F22bF620B811932466' as `0x${string}`
const TEMPO_CONTRACT = '0x0007473c10FCf7b56C349f30fc13b1717397f08C' as `0x${string}`
const RH_CONTRACT    = '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10' as `0x${string}`

const BADGE_MINTED_EVENT = parseAbiItem(
  'event BadgeMinted(address indexed user, uint256 indexed quizId, uint256 tokenId)'
)

// ── Viem clients (read-only, no wallet needed) ─────────────────────
const arcClient   = createPublicClient({ chain: arcTestnet,        transport: http() })
const tempoClient = createPublicClient({ chain: tempoTestnet,      transport: http() })
const rhClient    = createPublicClient({ chain: robinhoodTestnet,  transport: http() })

// ── Types ──────────────────────────────────────────────────────────
interface UserStats {
  address: string
  arc: number
  tempo: number
  robinhood: number
  total: number
}

type TabKey = 'all' | 'arc' | 'tempo' | 'robinhood'

const TABS: { key: TabKey; label: string; emoji: string; color: string }[] = [
  { key: 'all',       label: 'All Chains',     emoji: '🌐', color: '#64748b' },
  { key: 'arc',       label: 'Arc',            emoji: '◈',  color: '#3b82f6' },
  { key: 'tempo',     label: 'Tempo',          emoji: '🎵', color: '#8b5cf6' },
  { key: 'robinhood', label: 'Robinhood',      emoji: '🔴', color: '#22c55e' },
]

// ── Cache ──────────────────────────────────────────────────────────
const CACHE_KEY = 'leaderboard_v4'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Quiz launched 2026-03-10. 500k blocks at ~2s/block ≈ 11 days — covers all real mints.
const RECENT_WINDOW = BigInt(500_000)
const MAX_PARALLEL  = 10  // concurrent getLogs requests

// Candidate chunk sizes to probe (largest first → fewest requests win)
const PROBE_SIZES = [500_000n, 100_000n, 50_000n, 20_000n, 10_000n, 5_000n, 2_000n]

function mapLogs(raw: any[]): { user: string }[] {
  return raw.map((l: any) => ({ user: l.args.user as string }))
}

async function paginateRange(
  client: ReturnType<typeof createPublicClient>,
  address: `0x${string}`,
  from: bigint, to: bigint, chunkSize: bigint
): Promise<{ user: string }[]> {
  const chunks: [bigint, bigint][] = []
  for (let f = from; f <= to; f += chunkSize) {
    chunks.push([f, f + chunkSize - 1n < to ? f + chunkSize - 1n : to])
  }
  const all: { user: string }[] = []
  for (let i = 0; i < chunks.length; i += MAX_PARALLEL) {
    const results = await Promise.allSettled(
      chunks.slice(i, i + MAX_PARALLEL).map(([f, t]) =>
        (client as any).getLogs({ address, event: BADGE_MINTED_EVENT, fromBlock: f, toBlock: t })
      )
    )
    for (const r of results)
      if (r.status === 'fulfilled') all.push(...mapLogs(r.value as any[]))
  }
  return all
}

async function fetchLogs(
  client: ReturnType<typeof createPublicClient>,
  address: `0x${string}`
): Promise<{ logs: { user: string }[]; ok: boolean }> {
  // Stage 1 — full range (Robinhood / standard RPCs)
  try {
    return { logs: mapLogs(await (client as any).getLogs({
      address, event: BADGE_MINTED_EVENT, fromBlock: 0n, toBlock: 'latest',
    })), ok: true }
  } catch { /* fall through */ }

  // Stage 2 — get current block number
  let latest: bigint
  try { latest = await (client as any).getBlockNumber() }
  catch { return { logs: [], ok: false } }

  const fromBlock = latest > RECENT_WINDOW ? latest - RECENT_WINDOW : 0n

  // Stage 3 — probe to find max allowed chunk size, then paginate efficiently.
  // Each probe queries only the last N blocks. First one that succeeds tells us
  // the RPC's range limit → use that size for the full scan (fewer total requests).
  // Example: if Arc allows 10k, we use 10k chunks → 50 chunks / 10 parallel = 5 batches ≈ 1 s
  for (const probe of PROBE_SIZES) {
    const probeFrom = latest > probe ? latest - probe : 0n
    try {
      const raw = await (client as any).getLogs({
        address, event: BADGE_MINTED_EVENT, fromBlock: probeFrom, toBlock: latest,
      })
      const probeLogs = mapLogs(raw)
      // Probe covered the full window → done in 1 request
      if (probeFrom <= fromBlock) return { logs: probeLogs, ok: true }
      // Probe worked but only partial — scan the remainder with same chunk size
      const rest = await paginateRange(client, address, fromBlock, probeFrom - 1n, probe)
      return { logs: [...rest, ...probeLogs], ok: true }
    } catch { /* try smaller probe */ }
  }

  return { logs: [], ok: false }
}

function buildLeaderboard(
  arcLogs: { user: string }[],
  tempoLogs: { user: string }[],
  rhLogs: { user: string }[]
) {
  const map = new Map<string, UserStats>()
  const bump = (logs: { user: string }[], chain: 'arc' | 'tempo' | 'robinhood') => {
    for (const { user } of logs) {
      const key = user.toLowerCase()
      if (!map.has(key)) map.set(key, { address: user, arc: 0, tempo: 0, robinhood: 0, total: 0 })
      const s = map.get(key)!
      s[chain]++
      s.total++
    }
  }
  bump(arcLogs, 'arc')
  bump(tempoLogs, 'tempo')
  bump(rhLogs, 'robinhood')
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

function fmt(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

// ── Component ──────────────────────────────────────────────────────
export default function LeaderboardPage({
  onViewProfile,
  onBack,
}: {
  onViewProfile?: (addr: string) => void
  onBack?: () => void
}) {
  const { address } = useAccount()
  const [rows, setRows] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [tab, setTab] = useState<TabKey>('all')
  const [chainOk, setChainOk] = useState({ arc: true, tempo: true, robinhood: true })

  const load = useCallback(async (force = false) => {
    setLoading(true)
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) {
          const { data, ts, ok } = JSON.parse(raw)
          if (Date.now() - ts < CACHE_TTL) {
            setRows(data); setLastUpdated(new Date(ts))
            if (ok) setChainOk(ok)
            setLoading(false); return
          }
        }
      } catch {}
    }
    const [arcRes, tempoRes, rhRes] = await Promise.all([
      fetchLogs(arcClient, ARC_CONTRACT),
      fetchLogs(tempoClient, TEMPO_CONTRACT),
      fetchLogs(rhClient, RH_CONTRACT),
    ])
    const ok = { arc: arcRes.ok, tempo: tempoRes.ok, robinhood: rhRes.ok }
    setChainOk(ok)
    const built = buildLeaderboard(arcRes.logs, tempoRes.logs, rhRes.logs)
    setRows(built)
    const ts = Date.now()
    setLastUpdated(new Date(ts))
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: built, ts, ok })) } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Sort/filter by active tab
  const display = tab === 'all'
    ? rows
    : [...rows].sort((a, b) => b[tab] - a[tab]).filter(r => r[tab] > 0)

  const myIdx  = address ? display.findIndex(r => r.address.toLowerCase() === address.toLowerCase()) : -1
  const myRank = myIdx + 1

  const tabInfo = TABS.find(t => t.key === tab)!
  const totalBadges = rows.reduce((sum, r) => sum + r.total, 0)

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Back button */}
          {onBack && (
            <button onClick={onBack} style={{
              marginTop: '2px', flexShrink: 0,
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '8px', color: '#94a3b8',
              cursor: 'pointer', fontWeight: 700, fontSize: '13px',
              padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}>
              ← Back
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              🏆 Leaderboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {totalBadges > 0 ? `${totalBadges} total badges · ${rows.length} unique addresses` : 'Loading on-chain data…'}
              {lastUpdated && (
                <span style={{ marginLeft: '8px', color: '#334155' }}>
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <button onClick={() => load(true)} disabled={loading} style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '8px', color: '#64748b',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: '12px', padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: '6px',
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? '⏳' : '↻'} {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* My rank card (if connected and in board) */}
      {address && myRank > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0d1424, #111827)',
          border: '1px solid #3b82f666', borderRadius: '14px',
          padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '28px' }}>{RANK_ICONS[myRank] ?? `#${myRank}`}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Your Rank</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#e2e8f0', fontFamily: 'monospace' }}>
              {fmt(address)} · #{myRank} of {display.length}
            </div>
          </div>
          {display[myIdx] && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total', value: display[myIdx].total, color: '#f1f5f9' },
                { label: '◈ Arc', value: display[myIdx].arc, color: '#3b82f6' },
                { label: '🎵 Tempo', value: display[myIdx].tempo, color: '#8b5cf6' },
                { label: '🔴 RH', value: display[myIdx].robinhood, color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? `${t.color}22` : '#0d1424',
            border: `1px solid ${tab === t.key ? t.color + '66' : '#1e293b'}`,
            borderRadius: '8px', color: tab === t.key ? t.color : '#64748b',
            cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s',
          }}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 60px 60px 60px 70px',
          gap: '0', padding: '10px 16px',
          background: '#080d18', borderBottom: '1px solid #1e293b',
          fontSize: '10px', fontWeight: 700, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          <div style={{ textAlign: 'center' }}>#</div>
          <div>Address</div>
          <div style={{ textAlign: 'center', color: '#3b82f666' }}>◈</div>
          <div style={{ textAlign: 'center', color: '#8b5cf666' }}>🎵</div>
          <div style={{ textAlign: 'center', color: '#22c55e66' }}>🔴</div>
          <div style={{ textAlign: 'right' }}>Total</div>
        </div>

        {/* Loading skeleton */}
        {loading && rows.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '13px' }}>Fetching on-chain badge events…</div>
            <div style={{ fontSize: '11px', marginTop: '4px', color: '#334155' }}>Querying Arc · Tempo · Robinhood</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && display.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
            <div style={{ fontSize: '13px' }}>No badges minted yet on {tabInfo.label}</div>
          </div>
        )}

        {/* Rows */}
        {display.slice(0, 50).map((row, i) => {
          const rank = i + 1
          const isMe = address && row.address.toLowerCase() === address.toLowerCase()
          const rankIcon = RANK_ICONS[rank]
          const chainVal = tab === 'all' ? row.total : row[tab]

          return (
            <div key={row.address} style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 60px 60px 60px 70px',
              gap: '0', padding: '11px 16px',
              borderBottom: '1px solid #0f172a',
              background: isMe ? 'rgba(59,130,246,0.06)' : rank <= 3 ? `rgba(255,255,255,0.01)` : 'transparent',
              borderLeft: isMe ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'background 0.15s',
            }}>
              {/* Rank */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: rankIcon ? '16px' : '13px', fontWeight: 800, color: rank <= 3 ? '#f1f5f9' : '#475569', fontFamily: 'monospace' }}>
                {rankIcon ?? rank}
              </div>

              {/* Address */}
              <div
                onClick={() => onViewProfile?.(row.address)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: onViewProfile ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, #${row.address.slice(2, 8)}, #${row.address.slice(-6)})`,
                  opacity: 0.8,
                }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isMe ? '#93c5fd' : '#e2e8f0', fontFamily: 'monospace' }}>
                    {fmt(row.address)}
                  </span>
                  {isMe && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#3b82f6', fontWeight: 800 }}>YOU</span>}
                  {onViewProfile && <span style={{ marginLeft: '5px', fontSize: '10px', color: '#334155' }}>→</span>}
                </div>
              </div>

              {/* Per-chain counts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: row.arc > 0 ? 700 : 400, color: row.arc > 0 ? '#3b82f6' : '#1e293b' }}>
                {row.arc > 0 ? row.arc : '·'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: row.tempo > 0 ? 700 : 400, color: row.tempo > 0 ? '#8b5cf6' : '#1e293b' }}>
                {row.tempo > 0 ? row.tempo : '·'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: row.robinhood > 0 ? 700 : 400, color: row.robinhood > 0 ? '#22c55e' : '#1e293b' }}>
                {row.robinhood > 0 ? row.robinhood : '·'}
              </div>

              {/* Total */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div style={{
                  background: rank === 1 ? '#f59e0b22' : rank === 2 ? '#94a3b822' : rank === 3 ? '#cd7f3222' : '#1e293b',
                  borderRadius: '6px', padding: '3px 10px',
                  fontSize: '13px', fontWeight: 900,
                  color: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : '#94a3b8',
                  fontFamily: 'monospace',
                }}>
                  {tab === 'all' ? row.total : chainVal}
                </div>
              </div>
            </div>
          )
        })}

        {/* Footer */}
        {display.length > 0 && (
          <div style={{ padding: '10px 16px', fontSize: '11px', color: '#334155', textAlign: 'center', borderTop: '1px solid #0f172a' }}>
            Showing top {Math.min(display.length, 50)} of {display.length} addresses · Data from on-chain events
          </div>
        )}
      </div>

      {/* Info footer */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'arc' as const,       emoji: '◈',  label: 'Arc Testnet',    color: '#3b82f6', total: rows.reduce((s, r) => s + r.arc, 0) },
          { key: 'tempo' as const,     emoji: '🎵', label: 'Tempo Moderato', color: '#8b5cf6', total: rows.reduce((s, r) => s + r.tempo, 0) },
          { key: 'robinhood' as const, emoji: '🔴', label: 'Robinhood Chain', color: '#22c55e', total: rows.reduce((s, r) => s + r.robinhood, 0) },
        ].map(c => {
          const ok = chainOk[c.key]
          return (
            <div key={c.label} style={{
              flex: 1, minWidth: '120px', background: '#0d1424',
              border: `1px solid ${ok ? c.color + '22' : '#ef444433'}`,
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: ok ? c.color : '#64748b' }}>
                  {ok ? c.total : '?'}
                </div>
                <div style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>{c.label}</div>
              </div>
              {!ok && (
                <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, background: '#ef444420', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>
                  RPC err
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* RPC warning */}
      {(!chainOk.arc || !chainOk.tempo || !chainOk.robinhood) && (
        <div style={{
          marginTop: '10px', padding: '10px 14px', borderRadius: '10px',
          background: '#ef444410', border: '1px solid #ef444430',
          fontSize: '12px', color: '#f87171',
        }}>
          ⚠️ Some chains failed to load — the RPC may have block range limits. Try <button onClick={() => load(true)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', padding: 0 }}>refreshing</button>.
        </div>
      )}
    </div>
  )
}
