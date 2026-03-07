import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { encodeFunctionData, parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI } from '../abi/contracts'

export function useStartRound() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  const startRound = (asset: string) => {
    // Mã hóa dữ liệu hàm startRound
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'startRound',
      args: [asset],
    })

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI, // Vẫn giữ ABI để ví hiểu tên hàm
      functionName: 'startRound',
      args: [asset],
      // Thêm các thông số này để chặn ví tự nhảy sang mạng Ethereum
      type: 'legacy',
      gas: 500000n, // Ép giới hạn gas vừa đủ
      gasPrice: parseUnits('1', 9), // Đặt gas price cố định
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
