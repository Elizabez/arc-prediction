import { useWriteContract, useReadContract, useChainId, useSwitchChain } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACT_ADDRESS, arcTestnet, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI } from '../abi/contracts'
import { erc20Abi } from 'viem'

export function useAdminActions() {
  const { writeContract, isPending } = useWriteContract()
  
  const approveUSDC = (amount: string) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, parseUnits(amount || '0', 6)],
    })
  }

  const depositPool = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount || '0', 6)],
    }, {
      onSettled: () => { console.log("Giao dịch đã kết thúc hoặc lỗi, nút đã mở khóa") }
    })
  }

  return { approveUSDC, depositPool, isPending }
}

export function useStartRound() {
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const startRound = (asset: string) => {
    if (chainId !== arcTestnet.id) {
      switchChain({ chainId: arcTestnet.id })
      return
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'startRound',
      args: [asset],
    })
  }
  return { startRound, isPending }
}
