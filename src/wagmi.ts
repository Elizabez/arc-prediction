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

export const config = createConfig({
  chains: [arcTestnet],
  // Bật tính năng phát hiện đa ví (EIP-6963) giúp OKX và MetaMask không tranh giành nhau
  multiInjectedProviderDiscovery: true, 
  connectors: [
    injected({ shimDisconnect: true }) 
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})
