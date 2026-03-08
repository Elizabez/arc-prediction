import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

export const arcTestnet = {
  id: 570,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer.buildonarc.com' },
  },
} as const

export const CONTRACT_ADDRESS = '0xa2B14137adad4b79a4c76955c7c30b2134fbee10'
export const USDC_ADDRESS = '0xcC4f910405A40F9063520A8d88e66e7465A71e09'

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, mainnet],
    transports: {
      [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
      [mainnet.id]: http(),
    },
    walletConnectProjectId: 'your-project-id',
    appName: 'ArcPredict Pro',
  })
)
