import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI, ERC20_ABI } from '../abi/contracts'

export function useStartRound() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  const startRound = (asset: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'startRound',
      args: [asset],
      // Ép ví dùng chế độ Legacy Gas để không đòi ETH
      gasPrice: parseUnits('0.1', 9), 
    })
  }

  return { startRound, isPending, isSuccess, error }
}

export function useNextRoundId() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'nextRoundId',
  })
}

export const formatUsdc = (value: bigint) => formatUnits(value, 6)
