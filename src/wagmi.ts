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

export const config = createConfig({
  chains: [arcTestnet],
  // Bật tính năng tự động phát hiện tất cả ví Injected (MetaMask, OKX, Trust,...)
  multiInjectedProviderDiscovery: true, 
  connectors: [
    injected({ shimDisconnect: true }) 
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})
