import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 6, name: 'USDC', symbol: 'USDC' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
})

// Lấy địa chỉ từ env của Vercel, nếu không có thì dùng địa chỉ mặc định
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10') as `0x${string}`
export const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238') as `0x${string}`

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
  },
})
