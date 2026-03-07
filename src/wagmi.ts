import { createConfig, http } from 'wagmi'
import { arcTestnet } from './App' // Hoặc định nghĩa trực tiếp nếu lỗi
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [{
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: { decimals: 6, name: 'USDC', symbol: 'USDC' },
    rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
    blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  }],
  connectors: [injected()],
  transports: { [5042002]: http() },
})
