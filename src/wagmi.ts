import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'Arc', symbol: 'ARC' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
})

// Quan trọng: Phải có chữ 'export' ở trước các biến này
export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
export const CONTRACT_ADDRESS = '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10'

export const config = createConfig({
  chains: [arcTestnet],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({ shimDisconnect: true })
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})
