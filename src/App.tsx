import { useState, useEffect } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, arcTestnet } from './wagmi'
import {
  useRound, useNextRoundId, useUserBet, useUsdcBalance, useUsdcAllowance,
  useApproveUsdc, usePlaceBet, useClaim, useStartRound, useResolveRound,
  formatUsdc, formatPrice, getRoundStatusLabel, timeLeft,
  type Round, type Position
} from './hooks/usePrediction'
import { parseUnits } from 'viem'

const queryClient = new QueryClient()

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown({ target }: { target: bigint }) {
  const [secs, setSecs] = useState(timeLeft(target))
  useEffect(() => {
    const id = setInterval(() => setSecs(timeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return <span className="font-mono tabular-nums">{m}:{s}</span>
}

// ─── Round Card ───────────────────────────────────────────────────────────────
function RoundCard({ roundId }: { roundId: bigint }) {
  const { data: round } = useRound(roundId)
  const { data: bet } = useUserBet(roundId)
  const { placeBet, isPending: isBetting, isSuccess: betSuccess } = usePlaceBet()
  const { approve, isPending: isApproving } = useApproveUsdc()
  const { data: allowance } = useUsdcAllowance()
  const { claim, isPending: isClaiming } = useClaim()
  const { lockRound, resolveRound } = useResolveRound()

  const [amount, setAmount] = useState('5')
  const [selected, setSelected] = useState<Position | null>(null)

  if (!round) return (
    <div className="round-card skeleton">
      <div className="shimmer" />
    </div>
  )

  const r = round as unknown as Round
  const status = getRoundStatusLabel(r.status as 0|1|2|3)
  const now = BigInt(Math.floor(Date.now() / 1000))
  const canLock = r.status === 1 && now >= r.lockTime
  const canResolve = r.status === 1 && now >= r.resolveTime
  const totalPool = r.totalUp + r.totalDown
  const upPct = totalPool > 0n ? Number(r.totalUp * 100n / totalPool) : 50
  const downPct = 100 - upPct
  const winner = r.status === 2 ? (r.closePrice > r.lockPrice ? 0 : 1) : null
  const isWinner = bet && r.status === 2 && bet.position === winner
  const isLoser = bet && r.status === 2 && bet.position !== winner

  async function handleBet(pos: Position) {
    const amtWei = parseUnits(amount, 6)
    if ((allowance ?? 0n) < amtWei) {
      approve(amount)
    } else {
      placeBet(r.roundId, pos, amount)
    }
  }

  return (
    <div className={`round-card ${status.toLowerCase()} ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}>
      {/* Header */}
      <div className="card-header">
        <div className="asset-badge">
          <span className="asset-icon">{r.asset === 'BTC' ? '₿' : 'Ξ'}</span>
          <span>{r.asset}/USD</span>
        </div>
        <div className={`status-pill ${status.toLowerCase()}`}>{status}</div>
        <span className="round-id">#{r.roundId.toString()}</span>
      </div>

      {/* Price display */}
      <div className="price-section">
        {r.lockPrice > 0n && (
          <div className="price-row">
            <span className="price-label">Lock</span>
            <span className="price-value">${formatPrice(r.lockPrice)}</span>
          </div>
        )}
        {r.closePrice > 0n && (
          <div className="price-row">
            <span className="price-label">Close</span>
            <span className={`price-value ${r.closePrice > r.lockPrice ? 'up' : 'down'}`}>
              ${formatPrice(r.closePrice)}
              {r.closePrice > r.lockPrice ? ' ▲' : ' ▼'}
            </span>
          </div>
        )}
      </div>

      {/* Pool bar */}
      <div className="pool-section">
        <div className="pool-bar">
          <div className="bar-up" style={{ width: `${upPct}%` }} title={`UP ${upPct}%`} />
          <div className="bar-down" style={{ width: `${downPct}%` }} title={`DOWN ${downPct}%`} />
        </div>
        <div className="pool-labels">
          <span className="up">▲ {formatUsdc(r.totalUp)} USDC ({upPct}%)</span>
          <span className="down">▼ {formatUsdc(r.totalDown)} USDC ({downPct}%)</span>
        </div>
      </div>

      {/* Timer */}
      {r.status === 0 && (
        <div className="timer">
          <span>Closes in</span>
          <Countdown target={r.lockTime} />
        </div>
      )}
      {r.status === 1 && (
        <div className="timer locked">
          <span>Resolves in</span>
          <Countdown target={r.resolveTime} />
        </div>
      )}

      {/* Bet section */}
      {r.status === 0 && !bet?.amount && (
        <div className="bet-section">
          <div className="amount-input">
            <span className="currency">USDC</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          <div className="bet-buttons">
            <button
              className="btn-up"
              onClick={() => handleBet(0)}
              disabled={isBetting || isApproving}
            >
              {isBetting || isApproving ? '...' : '▲ UP'}
            </button>
            <button
              className="btn-down"
              onClick={() => handleBet(1)}
              disabled={isBetting || isApproving}
            >
              {isBetting || isApproving ? '...' : '▼ DOWN'}
            </button>
          </div>
        </div>
      )}

      {/* User bet indicator */}
      {bet && bet.amount > 0n && (
        <div className={`user-bet ${bet.position === 0 ? 'up' : 'down'}`}>
          <span>Your bet:</span>
          <strong>{bet.position === 0 ? '▲ UP' : '▼ DOWN'}</strong>
          <span>{formatUsdc(bet.amount)} USDC</span>
          {isWinner && !bet.claimed && (
            <button className="btn-claim" onClick={() => claim(r.roundId)} disabled={isClaiming}>
              {isClaiming ? 'Claiming...' : '🎉 Claim'}
            </button>
          )}
          {isLoser && <span className="lost-badge">Lost</span>}
          {bet.claimed && <span className="claimed-badge">✓ Claimed</span>}
        </div>
      )}

      {/* Admin controls */}
      {canLock && (
        <button className="btn-admin" onClick={() => lockRound(r.roundId)}>🔒 Lock Round</button>
      )}
      {canResolve && (
        <button className="btn-admin" onClick={() => resolveRound(r.roundId)}>✅ Resolve</button>
      )}
    </div>
  )
}

// ─── Wallet button ────────────────────────────────────────────────────────────
function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useUsdcBalance()

  if (!isConnected) {
    return (
      <div className="wallet-connect">
        {connectors.map(c => (
          <button key={c.id} className="btn-connect" onClick={() => connect({ connector: c })}>
            Connect {c.name}
          </button>
        ))}
      </div>
    )
  }

  const wrongChain = chainId !== arcTestnet.id

  return (
    <div className="wallet-info">
      {wrongChain ? (
        <button className="btn-switch-chain" onClick={() => switchChain({ chainId: arcTestnet.id })}>
          ⚠ Switch to Arc Testnet
        </button>
      ) : (
        <div className="wallet-details">
          <span className="chain-badge">Arc Testnet</span>
          {balance !== undefined && (
            <span className="balance">{formatUsdc(balance as bigint)} USDC</span>
          )}
          <span className="address" title={address}>{address?.slice(0, 6)}…{address?.slice(-4)}</span>
        </div>
      )}
      <button className="btn-disconnect" onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

// ─── App inner ────────────────────────────────────────────────────────────────
function AppInner() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()
  const [asset, setAsset] = useState<'BTC' | 'ETH'>('BTC')
  const [tab, setTab] = useState<'BTC' | 'ETH'>('BTC')

  const totalRounds = nextId ? Number(nextId) - 1 : 0
  const roundIds = Array.from(
    { length: Math.min(6, totalRounds) },
    (_, i) => BigInt(totalRounds - i)
  ).filter(id => id > 0n)

  return (
    <div className="app">
      {/* Nav */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark">◈</div>
          <div>
            <div className="brand-name">ArcPredict</div>
            <div className="brand-sub">on Arc Testnet</div>
          </div>
        </div>
        <WalletButton />
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1>Predict <span className="gradient-text">Crypto Prices</span></h1>
          <p>Place your bet on BTC or ETH going UP or DOWN. Win USDC from the losing pool.</p>
          <div className="hero-stats">
            <div className="stat"><span className="stat-val">{totalRounds}</span><span className="stat-label">Rounds</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">2%</span><span className="stat-label">Fee</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">5min</span><span className="stat-label">Per Round</span></div>
          </div>
        </div>
        <div className="hero-bg">
          <div className="orb orb1" />
          <div className="orb orb2" />
        </div>
      </div>

      {/* Start Round */}
      {isConnected && (
        <div className="start-section">
          <div className="start-card">
            <h3>Start New Round</h3>
            <div className="start-controls">
              <div className="asset-tabs">
                {(['BTC', 'ETH'] as const).map(a => (
                  <button
                    key={a}
                    className={`asset-tab ${asset === a ? 'active' : ''}`}
                    onClick={() => setAsset(a)}
                  >
                    {a === 'BTC' ? '₿' : 'Ξ'} {a}
                  </button>
                ))}
              </div>
              <button
                className="btn-start"
                onClick={() => startRound(asset)}
                disabled={isStarting}
              >
                {isStarting ? 'Starting…' : `Start ${asset} Round`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rounds list */}
      <div className="rounds-section">
        <div className="section-header">
          <h2>Active Rounds</h2>
          <div className="filter-tabs">
            {(['BTC', 'ETH'] as const).map(a => (
              <button key={a} className={`filter-tab ${tab === a ? 'active' : ''}`} onClick={() => setTab(a)}>
                {a === 'BTC' ? '₿' : 'Ξ'} {a}
              </button>
            ))}
            <button className={`filter-tab ${!tab ? 'active' : ''}`} onClick={() => setTab('BTC')}>All</button>
          </div>
        </div>

        {roundIds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No rounds yet. Connect your wallet and start the first round!</p>
          </div>
        ) : (
          <div className="rounds-grid">
            {roundIds.map(id => <RoundCard key={id.toString()} roundId={id} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>Built on <a href="https://arc.network" target="_blank" rel="noreferrer">Arc Testnet</a> · Chain ID 5042002</span>
        <span>Gas: USDC · Finality: &lt;1s</span>
      </footer>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
