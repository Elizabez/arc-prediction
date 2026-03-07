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
import PriceChart from './components/PriceChart'
import ResultModal from './components/ResultModal'

const queryClient = new QueryClient()

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

function RoundCard({ roundId, onSelect, isSelected }: { roundId: bigint; onSelect: (id: bigint, asset: 'BTC'|'ETH') => void; isSelected: boolean }) {
  const { data: round } = useRound(roundId)
  const { data: bet } = useUserBet(roundId)
  const { placeBet, isPending: isBetting } = usePlaceBet()
  const { approve, isPending: isApproving } = useApproveUsdc()
  const { data: allowance } = useUsdcAllowance()
  const { claim, isPending: isClaiming, isSuccess: claimSuccess } = useClaim()
  const { lockRound, resolveRound } = useResolveRound()
  const [amount, setAmount] = useState('5')
  const [showModal, setShowModal] = useState(false)

  if (!round) return <div className="round-card skeleton"><div className="shimmer" /></div>

  const r = round as unknown as Round
  const status = getRoundStatusLabel(r.status as 0|1|2|3)
  const now = BigInt(Math.floor(Date.now() / 1000))
  const canLock = r.status === 1 && now >= r.lockTime
  const canResolve = r.status === 1 && now >= r.resolveTime
  const totalPool = r.totalUp + r.totalDown
  const upPct = totalPool > 0n ? Number(r.totalUp * 100n / totalPool) : 50
  const downPct = 100 - upPct
  const winner = r.status === 2 ? (r.closePrice > r.lockPrice ? 0 : 1) : null
  const isWinner = bet && r.status === 2 && Number(bet.amount) > 0 && bet.position === winner
  const isLoser = bet && r.status === 2 && Number(bet.amount) > 0 && bet.position !== winner
  const winnerPool = winner === 0 ? r.totalUp : r.totalDown
  const userPayout = bet && r.status === 2 && isWinner && winnerPool > 0n
    ? (bet.amount * (totalPool - (totalPool * 200n / 10000n))) / winnerPool
    : 0n

  async function handleBet(pos: Position) {
    const amtWei = parseUnits(amount, 6)
    if ((allowance ?? 0n) < amtWei) { approve(amount) }
    else { placeBet(r.roundId, pos, amount) }
  }

  return (
    <>
      <div
        className={`round-card ${status.toLowerCase()} ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(roundId, r.asset as 'BTC'|'ETH')}
      >
        <div className="card-header">
          <div className="asset-badge">
            <span className="asset-icon">{r.asset === 'BTC' ? '₿' : 'Ξ'}</span>
            <span>{r.asset}/USD</span>
          </div>
          <div className={`status-pill ${status.toLowerCase()}`}>{status}</div>
          <span className="round-id">#{r.roundId.toString()}</span>
        </div>

        {(r.lockPrice > 0n || r.closePrice > 0n) && (
          <div className="price-section">
            {r.lockPrice > 0n && (
              <div className="price-row">
                <span className="price-label">🔒 Lock</span>
                <span className="price-value" style={{color:'#f5c842'}}>${formatPrice(r.lockPrice)}</span>
              </div>
            )}
            {r.closePrice > 0n && (
              <div className="price-row">
                <span className="price-label">✓ Close</span>
                <span className={`price-value ${r.closePrice > r.lockPrice ? 'up' : 'down'}`}>
                  ${formatPrice(r.closePrice)} {r.closePrice > r.lockPrice ? '▲' : '▼'}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="pool-section">
          <div className="pool-bar">
            <div className="bar-up" style={{ width: `${upPct}%` }} />
            <div className="bar-down" style={{ width: `${downPct}%` }} />
          </div>
          <div className="pool-labels">
            <span className="up">▲ {formatUsdc(r.totalUp)} ({upPct}%)</span>
            <span className="down">▼ {formatUsdc(r.totalDown)} ({downPct}%)</span>
          </div>
          {totalPool > 0n && <div className="pool-total">Pool: <strong>{formatUsdc(totalPool)} USDC</strong></div>}
        </div>

        {r.status === 0 && <div className="timer"><span>Closes in</span><Countdown target={r.lockTime} /></div>}
        {r.status === 1 && <div className="timer locked"><span>Resolves in</span><Countdown target={r.resolveTime} /></div>}

        {r.status === 0 && (!bet || Number(bet.amount) === 0) && (
          <div className="bet-section" onClick={e => e.stopPropagation()}>
            <div className="amount-input">
              <span className="currency">USDC</span>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="quick-amounts">
                {['1','5','10','50'].map(v => (
                  <button key={v} className={`quick-btn ${amount===v?'active':''}`} onClick={() => setAmount(v)}>{v}</button>
                ))}
              </div>
            </div>
            <div className="bet-buttons">
              <button className="btn-up" onClick={() => handleBet(0)} disabled={isBetting||isApproving}>
                {isBetting||isApproving ? '...' : `▲ UP · ${downPct>50?(((100+downPct)/100).toFixed(2)+'x'):''}`}
              </button>
              <button className="btn-down" onClick={() => handleBet(1)} disabled={isBetting||isApproving}>
                {isBetting||isApproving ? '...' : `▼ DOWN · ${upPct>50?(((100+upPct)/100).toFixed(2)+'x'):''}`}
              </button>
            </div>
          </div>
        )}

        {bet && Number(bet.amount) > 0 && (
          <div className={`user-bet ${bet.position===0?'up':'down'}`} onClick={e => e.stopPropagation()}>
            <span>Your bet:</span>
            <strong>{bet.position===0?'▲ UP':'▼ DOWN'}</strong>
            <span>{formatUsdc(bet.amount)} USDC</span>
            {isWinner && !bet.claimed && (
              <button className="btn-claim" onClick={() => setShowModal(true)}>
                🎉 +{formatUsdc(userPayout)} USDC
              </button>
            )}
            {isLoser && <span className="lost-badge">✗ -{formatUsdc(bet.amount)}</span>}
            {bet.claimed && <span className="claimed-badge">✓ Claimed</span>}
          </div>
        )}

        {canLock && <button className="btn-admin" onClick={e=>{e.stopPropagation();lockRound(r.roundId)}}>🔒 Lock Round</button>}
        {canResolve && <button className="btn-admin" onClick={e=>{e.stopPropagation();resolveRound(r.roundId)}}>✅ Resolve</button>}
      </div>

      {bet && Number(bet.amount) > 0 && r.status === 2 && (
        <ResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          won={!!isWinner}
          position={bet.position as 0|1}
          betAmount={bet.amount}
          payout={userPayout}
          lockPrice={r.lockPrice}
          closePrice={r.closePrice}
          asset={r.asset}
          onClaim={() => { claim(r.roundId); setTimeout(() => setShowModal(false), 2000) }}
          isClaiming={isClaiming}
          claimed={bet.claimed || claimSuccess}
        />
      )}
    </>
  )
}

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useUsdcBalance()

  if (!isConnected) return (
    <div className="wallet-connect">
      {connectors.slice(0,2).map(c => (
        <button key={c.id} className="btn-connect" onClick={() => connect({ connector: c })}>
          Connect {c.name}
        </button>
      ))}
    </div>
  )

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
          {balance !== undefined && <span className="balance">{formatUsdc(balance as bigint)} USDC</span>}
          <span className="address">{address?.slice(0,6)}…{address?.slice(-4)}</span>
        </div>
      )}
      <button className="btn-disconnect" onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

function AppInner() {
  const { isConnected } = useAccount()
  const { data: nextId } = useNextRoundId()
  const { startRound, isPending: isStarting } = useStartRound()
  const [asset, setAsset] = useState<'BTC'|'ETH'>('BTC')
  const [chartAsset, setChartAsset] = useState<'BTC'|'ETH'>('BTC')
  const [selectedRound, setSelectedRound] = useState<bigint|null>(null)
  const { data: selectedRoundData } = useRound(selectedRound ?? undefined)

  const totalRounds = nextId ? Number(nextId) - 1 : 0
  const roundIds = Array.from({ length: Math.min(9, totalRounds) }, (_, i) => BigInt(totalRounds - i)).filter(id => id > 0n)

  const sr = selectedRoundData as unknown as Round | undefined
  const chartLockPrice = sr?.lockPrice && sr.lockPrice > 0n ? Number(sr.lockPrice) / 1e8 : undefined
  const chartClosePrice = sr?.closePrice && sr.closePrice > 0n ? Number(sr.closePrice) / 1e8 : undefined

  function handleSelectRound(rid: bigint, a: 'BTC'|'ETH') {
    setSelectedRound(rid === selectedRound ? null : rid)
    setChartAsset(a)
  }

  return (
    <div className="app">
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

      {/* Live Chart */}
      <div className="chart-section">
        <div className="chart-tabs">
          {(['BTC','ETH'] as const).map(a => (
            <button key={a} className={`chart-tab ${chartAsset===a?'active':''}`} onClick={() => setChartAsset(a)}>
              {a==='BTC'?'₿':'Ξ'} {a}
            </button>
          ))}
          {selectedRound !== null && sr && (
            <span className="chart-round-hint">
              Viewing Round #{selectedRound.toString()}
              {chartLockPrice ? ` · Lock $${chartLockPrice.toLocaleString('en-US',{maximumFractionDigits:2})}` : ''}
              {chartClosePrice ? ` · Close $${chartClosePrice.toLocaleString('en-US',{maximumFractionDigits:2})}` : ''}
            </span>
          )}
        </div>
        <PriceChart
          asset={chartAsset}
          lockPrice={sr?.asset === chartAsset ? chartLockPrice : undefined}
          closePrice={sr?.asset === chartAsset ? chartClosePrice : undefined}
          status={sr?.asset === chartAsset ? sr?.status : undefined}
        />
      </div>

      {/* Stats bar */}
      <div className="hero-stats-bar">
        <div className="stat"><span className="stat-val">{totalRounds}</span><span className="stat-label">Rounds</span></div>
        <div className="stat-divider" />
        <div className="stat"><span className="stat-val">2%</span><span className="stat-label">Fee</span></div>
        <div className="stat-divider" />
        <div className="stat"><span className="stat-val">5min</span><span className="stat-label">Duration</span></div>
        <div className="stat-divider" />
        <div className="stat"><span className="stat-val">USDC</span><span className="stat-label">Gas & Bet</span></div>
      </div>

      {isConnected && (
        <div className="start-section">
          <div className="start-card">
            <h3>Start New Round</h3>
            <div className="start-controls">
              <div className="asset-tabs">
                {(['BTC','ETH'] as const).map(a => (
                  <button key={a} className={`asset-tab ${asset===a?'active':''}`} onClick={() => setAsset(a)}>
                    {a==='BTC'?'₿':'Ξ'} {a}
                  </button>
                ))}
              </div>
              <button className="btn-start" onClick={() => startRound(asset)} disabled={isStarting}>
                {isStarting ? 'Starting…' : `▶ Start ${asset} Round`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounds-section">
        <div className="section-header">
          <h2>Rounds</h2>
          <span className="section-hint">Click a round to overlay on chart</span>
        </div>
        {roundIds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No rounds yet. Connect your wallet and start the first round!</p>
          </div>
        ) : (
          <div className="rounds-grid">
            {roundIds.map(id => (
              <RoundCard key={id.toString()} roundId={id} onSelect={handleSelectRound} isSelected={selectedRound === id} />
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        <span>Built on <a href="https://arc.network" target="_blank" rel="noreferrer">Arc Testnet</a> · Chain ID 5042002</span>
        <span>
          Contract: <a href={`https://testnet.arcscan.app/address/${import.meta.env['VITE_CONTRACT_ADDRESS']}`} target="_blank" rel="noreferrer">
            {(import.meta.env['VITE_CONTRACT_ADDRESS'] as string)?.slice(0,10)}...
          </a>
        </span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
