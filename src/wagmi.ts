import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { 
    decimals: 6, 
    name: 'USDC', 
    symbol: 'USDC' // Ép ví phải hiển thị USDC thay vì ETH
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
})

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
export const CONTRACT_ADDRESS = '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10'

export const config = createConfig({
  chains: [arcTestnet],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({ 
      shimDisconnect: true,
      target: 'sdk' // Giúp nhận diện đúng loại ví đang dùng
    })
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})
