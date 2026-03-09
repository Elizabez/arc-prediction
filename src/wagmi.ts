import { createConfig, http } from 'wagmi'
import { createClient } from 'viem'
import { getDefaultConfig } from 'connectkit'

export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
} as const

export const tempoTestnet = {
  id: 42431,
  name: 'Tempo Testnet',
  nativeCurrency: { name: 'AlphaUSD', symbol: 'aUSD', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.moderato.tempo.xyz'] } },
  blockExplorers: { default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' } },
  testnet: true,
} as const

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, tempoTestnet],
    client({ chain }) {
      return createClient({ chain, transport: http() })
    },
    walletConnectProjectId: import.meta.env['VITE_WALLETCONNECT_PROJECT_ID'] ?? '',
    appName: 'OnChainGM Quiz',
    appDescription: 'Learn Web3 — earn Soulbound NFT badges on Arc & Tempo',
    appUrl: 'https://arc-prediction-eight.vercel.app',
  })
)
