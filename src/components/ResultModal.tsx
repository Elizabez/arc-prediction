import { useEffect, useState } from 'react'
import { formatUsdc, formatPrice } from '../hooks/usePrediction'

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  won: boolean
  position: 0 | 1
  betAmount: bigint
  payout: bigint
  lockPrice: bigint
  closePrice: bigint
  asset: string
  onClaim: () => void
  isClaiming: boolean
  claimed: boolean
}

export default function ResultModal({
  isOpen, onClose, won, position, betAmount, payout,
  lockPrice, closePrice, asset, onClaim, isClaiming, claimed
}: ResultModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) setTimeout(() => setShow(true), 10)
    else setShow(false)
  }, [isOpen])

  if (!isOpen) return null

  const profit = payout - betAmount
  const priceDir = closePrice > lockPrice ? 'UP' : 'DOWN'

  return (
    <div className={`modal-overlay ${show ? 'visible' : ''}`} onClick={onClose}>
      <div className={`result-modal ${show ? 'visible' : ''} ${won ? 'won' : 'lost'}`} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="result-icon">{won ? '🎉' : '😔'}</div>
        <h2 className={`result-title ${won ? 'up' : 'down'}`}>
          {won ? 'You Won!' : 'Better Luck Next Time'}
        </h2>

        <div className="result-stats">
          <div className="result-row">
            <span>Your position</span>
            <span className={position === 0 ? 'up' : 'down'}>
              {position === 0 ? '▲ UP' : '▼ DOWN'}
            </span>
          </div>
          <div className="result-row">
            <span>Result</span>
            <span className={priceDir === 'UP' ? 'up' : 'down'}>
              {priceDir === 'UP' ? '▲ UP' : '▼ DOWN'}
            </span>
          </div>
          <div className="result-row">
            <span>Lock price</span>
            <span>${formatPrice(lockPrice)}</span>
          </div>
          <div className="result-row">
            <span>Close price</span>
            <span className={closePrice > lockPrice ? 'up' : 'down'}>
              ${formatPrice(closePrice)}
            </span>
          </div>
          <div className="result-divider" />
          <div className="result-row">
            <span>Your bet</span>
            <span>{formatUsdc(betAmount)} USDC</span>
          </div>
          {won && (
            <>
              <div className="result-row">
                <span>Payout</span>
                <span className="up">+{formatUsdc(payout)} USDC</span>
              </div>
              <div className="result-row profit">
                <span>Profit</span>
                <span className="up">+{formatUsdc(profit)} USDC</span>
              </div>
            </>
          )}
          {!won && (
            <div className="result-row">
              <span>Lost</span>
              <span className="down">-{formatUsdc(betAmount)} USDC</span>
            </div>
          )}
        </div>

        {won && !claimed && (
          <button className="btn-claim-big" onClick={onClaim} disabled={isClaiming}>
            {isClaiming ? 'Claiming...' : `🏆 Claim ${formatUsdc(payout)} USDC`}
          </button>
        )}
        {claimed && (
          <div className="claimed-success">✓ Claimed successfully!</div>
        )}
      </div>
    </div>
  )
}
