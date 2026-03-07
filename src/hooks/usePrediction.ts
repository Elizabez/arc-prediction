import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI, ERC20_ABI } from '../abi/contracts'

export type RoundStatus = 0 | 1 | 2 | 3 // OPEN | LOCKED | RESOLVED | CANCELLED
export type Position = 0 | 1 // UP | DOWN

export interface Round {
  roundId: bigint
  asset: string
  startTime: bigint
  lockTime: bigint
  resolveTime: bigint
  lockPrice: bigint
  closePrice: bigint
  totalUp: bigint
  totalDown: bigint
  status: RoundStatus
  priceFeed: `0x${string}`
}

export interface Bet {
  position: Position
  amount: bigint
  claimed: boolean
}

export function useRound(roundId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getRound',
    args: roundId !== undefined ? [roundId] : undefined,
    query: { enabled: roundId !== undefined, refetchInterval: 5000 },
  })
}

export function useNextRoundId() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'nextRoundId',
    query: { refetchInterval: 5000 },
  })
}

export function useCurrentRounds() {
  const { data: nextId } = useNextRoundId()
  // Fetch last 5 rounds
  const ids = nextId
    ? Array.from({ length: Math.min(5, Number(nextId) - 1) }, (_, i) => BigInt(Number(nextId) - 1 - i))
    : []
  return ids
}

export function useUserBet(roundId: bigint | undefined) {
  const { address } = useAccount()
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getBet',
    args: roundId !== undefined && address ? [roundId, address] : undefined,
    query: { enabled: !!roundId && !!address, refetchInterval: 5000 },
  })
}

export function useCalculatePayout(roundId: bigint | undefined) {
  const { address } = useAccount()
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'calculatePayout',
    args: roundId !== undefined && address ? [roundId, address] : undefined,
    query: { enabled: !!roundId && !!address },
  })
}

export function useUsdcBalance() {
  const { address } = useAccount()
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  })
}

export function useUsdcAllowance() {
  const { address } = useAccount()
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && CONTRACT_ADDRESS ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS, refetchInterval: 5000 },
  })
}

export function useApproveUsdc() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = (amount: string) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, parseUnits(amount, 6)],
    })
  }

  return { approve, isPending: isPending || isConfirming, isSuccess }
}

export function usePlaceBet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const placeBet = (roundId: bigint, position: Position, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'bet',
      args: [roundId, position, parseUnits(amount, 6)],
    })
  }

  return { placeBet, isPending: isPending || isConfirming, isSuccess, error }
}

export function useClaim() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claim = (roundId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'claim',
      args: [roundId],
    })
  }

  return { claim, isPending: isPending || isConfirming, isSuccess }
}

export function useStartRound() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const startRound = (asset: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'startRound',
      args: [asset],
    })
  }

  return { startRound, isPending: isPending || isConfirming, isSuccess }
}

export function useResolveRound() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const lockRound = (roundId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'lockRound',
      args: [roundId],
    })
  }

  const resolveRound = (roundId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'resolveRound',
      args: [roundId],
    })
  }

  return { lockRound, resolveRound, isPending: isPending || isConfirming, isSuccess }
}

// Helpers
export function formatUsdc(wei: bigint): string {
  return parseFloat(formatUnits(wei, 6)).toFixed(2)
}

export function formatPrice(raw: bigint): string {
  return (Number(raw) / 1e8).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function getRoundStatusLabel(status: RoundStatus): string {
  return ['OPEN', 'LOCKED', 'RESOLVED', 'CANCELLED'][status]
}

export function timeLeft(target: bigint): number {
  return Math.max(0, Number(target) - Math.floor(Date.now() / 1000))
}
