import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

const CHAINS = [
  { emoji: '◈', name: 'Arc',       color: '#3b82f6' },
  { emoji: '🎵', name: 'Tempo',    color: '#8b5cf6' },
  { emoji: '🔴', name: 'Robinhood',color: '#22c55e' },
]

const CHAIN_MAP: Record<string, { emoji: string; name: string; color: string; desc: string }> = {
  arc:       { emoji: '◈',  name: 'Arc Testnet',      color: '#3b82f6', desc: 'AVM-powered blockchain with ultra-low fees' },
  tempo:     { emoji: '🎵', name: 'Tempo Testnet',     color: '#8b5cf6', desc: 'Payments-first Layer 1 by Stripe & Paradigm' },
  robinhood: { emoji: '🔴', name: 'Robinhood Chain',   color: '#22c55e', desc: 'DeFi L2 built on Arbitrum Orbit' },
}

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const chain  = searchParams.get('chain') ?? ''
  const chainInfo = CHAIN_MAP[chain]

  // Per-chain OG image
  if (chainInfo) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%',
          background: '#0a0f1a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', padding: '60px',
          position: 'relative',
        }}>
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: '-100px', left: '-100px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: `radial-gradient(circle, ${chainInfo.color}22 0%, transparent 70%)`,
            display: 'flex',
          }} />
          <div style={{
            position: 'absolute', bottom: '-100px', right: '-100px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: `radial-gradient(circle, ${chainInfo.color}18 0%, transparent 70%)`,
            display: 'flex',
          }} />

          {/* Chain icon */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '24px',
            background: `${chainInfo.color}20`,
            border: `3px solid ${chainInfo.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '52px', marginBottom: '24px',
            boxShadow: `0 0 40px ${chainInfo.color}33`,
          }}>{chainInfo.emoji}</div>

          {/* Title */}
          <div style={{
            fontSize: '52px', fontWeight: 900, color: chainInfo.color,
            marginBottom: '8px', display: 'flex', textAlign: 'center',
          }}>{chainInfo.name}</div>

          {/* Tagline */}
          <div style={{
            fontSize: '22px', color: '#94a3b8',
            marginBottom: '32px', display: 'flex', textAlign: 'center',
          }}>{chainInfo.desc}</div>

          {/* Badge pill */}
          <div style={{
            background: `${chainInfo.color}18`,
            border: `2px solid ${chainInfo.color}44`,
            borderRadius: '999px', padding: '12px 32px',
            fontSize: '22px', fontWeight: 700, color: '#f1f5f9',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            🏅 16 Soulbound NFT Badges — Free to earn
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: '28px',
            fontSize: '16px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>testnetquiz.xyz</span>
            <span>· Testnet Quiz</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Generic OG image (main page)
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0a0f1a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', padding: '60px',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 25% 50%, rgba(59,130,246,0.18) 0%, transparent 55%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 75% 50%, rgba(139,92,246,0.15) 0%, transparent 55%)',
          display: 'flex',
        }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '16px',
            background: 'rgba(59,130,246,0.2)', border: '2px solid rgba(59,130,246,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px', color: '#3b82f6',
            boxShadow: '0 0 30px rgba(59,130,246,0.3)',
          }}>◈</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', marginBottom: '4px' }}>Testnet</div>
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#3b82f6', letterSpacing: '-1px', display: 'flex' }}>Quiz</div>
          </div>
        </div>

        {/* Main headline */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '16px', gap: '2px',
        }}>
          <div style={{ fontSize: '58px', fontWeight: 900, color: '#f1f5f9', display: 'flex', letterSpacing: '-1.5px' }}>
            Master Blockchain.
          </div>
          <div style={{
            fontSize: '58px', fontWeight: 900, display: 'flex', letterSpacing: '-1.5px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #22c55e 100%)',
            WebkitBackgroundClip: 'text', color: 'transparent',
          }}>Earn Soulbound Badges.</div>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '21px', color: '#64748b', marginBottom: '40px',
          display: 'flex', textAlign: 'center', maxWidth: '700px',
        }}>
          Answer questions → mint non-transferable NFT badges proving your knowledge on-chain.
        </div>

        {/* Chain pills */}
        <div style={{ display: 'flex', gap: '14px' }}>
          {CHAINS.map(c => (
            <div key={c.name} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: `${c.color}18`, border: `2px solid ${c.color}44`,
              borderRadius: '999px', padding: '10px 22px',
              fontSize: '20px', fontWeight: 700, color: c.color,
            }}>
              <span>{c.emoji}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        {/* URL footer */}
        <div style={{
          position: 'absolute', bottom: '28px', right: '48px',
          fontSize: '15px', color: '#334155', display: 'flex',
        }}>
          testnetquiz.xyz
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
