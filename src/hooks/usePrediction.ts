import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI } from '../abi/contracts'

export function useStartRound() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  const startRound = (asset: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'startRound',
      args: [asset],
      // Arc yêu cầu Base Fee ~160 Gwei. Ta set dư ra một chút để mượt.
      gasPrice: parseUnits('200', 9), 
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

// Lưu ý: USDC token (ERC20) vẫn dùng 6 decimals cho số dư
export const formatUsdc = (value: bigint) => formatUnits(value, 6)
