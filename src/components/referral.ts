/**
 * Referral system — shared helpers for all chain dashboards.
 *
 * Ref code = first 8 hex chars of address (privacy-preserving, no full address in URL).
 * Resolution: prefix-match against BadgeMinted event logs already cached by LeaderboardPage.
 *
 * Contract is deployed from a fresh wallet (nonce 0) → same address on all chains.
 * Set VITE_REFERRAL_CONTRACT after deployment.
 */

import { createPublicClient, http, parseAbiItem } from 'viem'

// ── ABI ────────────────────────────────────────────────────────────
export const REFERRAL_ABI = [
  {
    name: 'trackReferral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'referrer', type: 'address' }],
    outputs: [],
  },
  {
    name: 'getReferralCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'referrer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'referralCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'Referred',
    type: 'event',
    inputs: [
      { indexed: true, name: 'referrer', type: 'address' },
      { indexed: true, name: 'referee', type: 'address' },
    ],
  },
] as const

// ── Contract address (same on all chains after fresh-wallet deploy) ─
export const REFERRAL_CONTRACT = (
  import.meta.env.VITE_REFERRAL_CONTRACT ?? ''
) as `0x${string}`

// ── localStorage ───────────────────────────────────────────────────
const LS_KEY = 'ref_code'

export function getStoredRefCode(): string | null {
  try { return localStorage.getItem(LS_KEY) } catch { return null }
}

export function storeRefCode(code: string) {
  try { localStorage.setItem(LS_KEY, code.toLowerCase()) } catch {}
}

// ── Resolve 8-char ref code → full address ─────────────────────────
// Strategy 1: check leaderboard cache (fastest, no network)
// Strategy 2: query BadgeMinted events on the given chain RPC
export async function resolveRefCode(
  code: string,
  chainRpcUrl: string,
  badgeContract: `0x${string}`,
): Promise<`0x${string}` | null> {
  const prefix = code.toLowerCase()

  // Strategy 1 — leaderboard localStorage cache (instant)
  try {
    const raw = localStorage.getItem('leaderboard_v4')
    if (raw) {
      const { data } = JSON.parse(raw)
      if (Array.isArray(data)) {
        const match = data.find((r: any) =>
          typeof r.address === 'string' &&
          r.address.toLowerCase().slice(2, 10) === prefix
        )
        if (match) return match.address as `0x${string}`
      }
    }
  } catch {}

  // Strategy 2 — fetch BadgeMinted events from the chain
  try {
    const client = createPublicClient({ transport: http(chainRpcUrl) })
    const BADGE_MINTED = parseAbiItem(
      'event BadgeMinted(address indexed user, uint256 indexed quizId, uint256 tokenId)'
    )
    // Try full range first, fall back to last 500k blocks
    let logs: any[]
    try {
      logs = await (client as any).getLogs({
        address: badgeContract, event: BADGE_MINTED,
        fromBlock: 0n, toBlock: 'latest',
      })
    } catch {
      const latest = await (client as any).getBlockNumber() as bigint
      const from = latest > 500_000n ? latest - 500_000n : 0n
      logs = await (client as any).getLogs({
        address: badgeContract, event: BADGE_MINTED,
        fromBlock: from, toBlock: latest,
      })
    }
    const match = logs.find((l: any) =>
      (l.args.user as string).toLowerCase().slice(2, 10) === prefix
    )
    if (match) return match.args.user as `0x${string}`
  } catch {}

  return null
}
