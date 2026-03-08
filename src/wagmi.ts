import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

export const arcTestnet = {
  id: 570,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.buildonarc.com'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer.buildonarc.com' },
  },
} as const

// ĐỊA CHỈ SMART CONTRACT - Vinh kiểm tra lại địa chỉ này nhé
export const CONTRACT_ADDRESS = '0xa2B14137adad4b79a4c76955c7c30b2134fbee10'
export const USDC_ADDRESS = '0xcC4f910405A40F9063520A8d88e66e7465A71e09' // Địa chỉ USDC trên Arc

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, mainnet],
    transports: {
      [arcTestnet.id]: http(),
      [mainnet.id]: http(),
    },
    walletConnectProjectId: 'your-project-id',
    appName: 'ArcPredict Pro',
  })
)
