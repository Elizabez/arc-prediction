import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useSwitchChain } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, arcTestnet, USDC_ADDRESS } from '../wagmi'
import { PREDICTION_MARKET_ABI } from '../abi/contracts'
import { erc20Abi } from 'viem'

export function useAdminActions() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  // Hàm Approve: Cho phép Contract rút USDC từ ví của Vinh
  const approveUSDC = (amount: string) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, parseUnits(amount, 6)],
    })
  }

  // Hàm Deposit: Nạp USDC vào Pool
  const depositPool = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'deposit', // Tên hàm giả định trong Contract của bạn
      args: [parseUnits(amount, 6)],
    })
  }

  // Hàm Withdraw: Rút USDC về ví (Chỉ Admin mới chạy được)
  const withdrawPool = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'withdraw', // Tên hàm giả định trong Contract của bạn
      args: [parseUnits(amount, 6)],
    })
  }

  return { approveUSDC, depositPool, withdrawPool, isPending, hash }
}

export function useStartRound() {
  const { writeContract, data: hash, isPending } = useWriteContract()
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
      gasPrice: parseUnits('200', 9),
    })
  }
  return { startRound, isPending }
}

export function useNextRoundId() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'nextRoundId',
  })
}
