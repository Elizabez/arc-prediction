import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`
export const CONTRACT_ADDRESS = '0xa2B14137adAd4B79A4c76955c7c30B2134Fbee10' as `0x${string}`

export const config = createConfig({
  chains: [arcTestnet],
  multiInjectedProviderDiscovery: true,
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
})
