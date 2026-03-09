export const ARC_QUIZ_ABI = [
  {
    type: 'function', name: 'submitQuiz', stateMutability: 'nonpayable',
    inputs: [
      { name: 'quizId', type: 'uint256' },
      { name: 'ans0', type: 'uint8' },
      { name: 'ans1', type: 'uint8' },
      { name: 'ans2', type: 'uint8' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'hasBadge', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'quizId', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function', name: 'getUserProgress', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool[10]' }],
  },
  {
    type: 'function', name: 'getUserBadges', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function', name: 'totalMinted', stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event', name: 'BadgeMinted',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'quizId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
    ],
  },
] as const

export interface QuizQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: number
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  questions: [QuizQuestion, QuizQuestion, QuizQuestion]
}

export const QUIZZES: QuizData[] = [
  {
    id: 1, title: "Welcome to Arc", emoji: "🌐",
    questions: [
      {
        question: "Arc is an open Layer-1 blockchain built by which company?",
        options: ["Ethereum Foundation", "Circle Internet Group", "Coinbase", "Binance Labs"],
        correctIndex: 1,
      },
      {
        question: "What is Arc's native gas token used for all transaction fees?",
        options: ["USDC", "ETH", "ARC", "EURC"],
        correctIndex: 0,
      },
      {
        question: "What is Arc's testnet Chain ID?",
        options: ["1", "137", "8453", "5042002"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 2, title: "Arc Gas & Fees", emoji: "⛽",
    questions: [
      {
        question: "What is the main benefit of Arc using USDC as gas instead of a volatile token?",
        options: ["Higher validator rewards", "Faster block times", "Predictable, stable transaction costs", "Lower security requirements"],
        correctIndex: 2,
      },
      {
        question: "How is Arc's fee model described?",
        options: ["High and unpredictable", "Low, predictable, dollar-denominated", "Free for all users", "Only free for institutions"],
        correctIndex: 1,
      },
      {
        question: "On Arc, the native USDC gas token uses how many decimals of precision?",
        options: ["18 decimals", "6 decimals", "8 decimals", "12 decimals"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 3, title: "Deterministic Finality", emoji: "⚡",
    questions: [
      {
        question: "What type of finality does Arc provide?",
        options: ["Probabilistic like Bitcoin", "Deterministic sub-second", "Eventual consistency", "2-minute confirmation"],
        correctIndex: 1,
      },
      {
        question: "Arc's finality benchmark with 100 validators and 1MB blocks is approximately:",
        options: ["2000ms", "1500ms", "780ms", "300ms"],
        correctIndex: 2,
      },
      {
        question: "What consensus engine powers Arc's deterministic finality?",
        options: ["Malachite BFT", "Proof of Work", "Delegated PoS", "Tendermint v1"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 4, title: "Arc Ecosystem", emoji: "🗺️",
    questions: [
      {
        question: "Where is Arc's official testnet block explorer?",
        options: ["etherscan.io", "polygonscan.com", "arcscan.io", "testnet.arcscan.app"],
        correctIndex: 3,
      },
      {
        question: "Where can developers get free testnet USDC for Arc?",
        options: ["arc.faucet.io", "faucet.circle.com", "testnet.arc.faucet", "uniswap.org"],
        correctIndex: 1,
      },
      {
        question: "What is Arc's official testnet RPC URL?",
        options: ["mainnet.arc.network", "node.arc.io", "rpc.testnet.arc.network", "api.arc.network"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 5, title: "Arc vs Other Chains", emoji: "⚔️",
    questions: [
      {
        question: "Unlike Ethereum which uses ETH for gas, Arc uses:",
        options: ["USDC stablecoin", "A new ARC token", "No gas at all", "Wrapped BTC"],
        correctIndex: 0,
      },
      {
        question: "What critical enterprise problem does Arc's stable fee model solve?",
        options: ["Slow developer onboarding", "Lack of smart contracts", "Low transaction throughput", "Gas price volatility"],
        correctIndex: 3,
      },
      {
        question: "Arc is purpose-built primarily for:",
        options: ["Gaming NFTs and metaverse", "Payments, FX, and capital markets", "Social media dApps", "Anonymous transactions"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 6, title: "EVM Compatibility", emoji: "🔧",
    questions: [
      {
        question: "Can existing Solidity smart contracts be deployed on Arc?",
        options: ["No, must be rewritten", "Only with Arc SDK", "Yes, without modification", "Only ERC-20 contracts"],
        correctIndex: 2,
      },
      {
        question: "Which developer tools are compatible with Arc out of the box?",
        options: ["wagmi, viem, ethers.js, Hardhat", "Only Truffle Suite", "Requires Arc CLI only", "None, custom tooling needed"],
        correctIndex: 0,
      },
      {
        question: "Arc is a public ___ network open to all developers:",
        options: ["Proof-of-Work", "Zero-knowledge only", "Permissioned private", "EVM-compatible Layer-1"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 7, title: "Arc & Circle", emoji: "🏢",
    questions: [
      {
        question: "Circle is the issuer of which major stablecoin?",
        options: ["USDT", "USDC", "DAI", "BUSD"],
        correctIndex: 1,
      },
      {
        question: "Arc integrates directly with Circle's full-stack platform, which includes:",
        options: ["Only USDC transfers", "Only Circle Wallets", "Circle's full-stack platform (USDC, CCTP, Gateway, Paymaster)", "Only Circle Mint"],
        correctIndex: 2,
      },
      {
        question: "Which Circle protocol enables cross-chain USDC transfers via burn-and-mint?",
        options: ["CCTP", "Wormhole", "LayerZero", "Axelar"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 8, title: "Arc Transactions", emoji: "💸",
    questions: [
      {
        question: "All Arc transaction fees are denominated and paid in:",
        options: ["ETH", "ARC token", "BTC", "USDC"],
        correctIndex: 3,
      },
      {
        question: "Arc's sub-second finality is most valuable for:",
        options: ["Long-term staking only", "Real-time payments and capital markets settlement", "Mining pool operations", "Offline transactions"],
        correctIndex: 1,
      },
      {
        question: "Arc's predictable fee design helps enterprises with:",
        options: ["Token speculation", "Validator selection", "Accounting and treasury workflows", "NFT minting only"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 9, title: "Opt-in Privacy", emoji: "🔒",
    questions: [
      {
        question: "Arc's opt-in privacy feature is designed to help institutions:",
        options: ["Stay compliant while protecting sensitive transaction data", "Hide all transactions from regulators permanently", "Avoid paying gas fees", "Mine blocks anonymously"],
        correctIndex: 0,
      },
      {
        question: "Arc's privacy architecture uses which technology for private computation?",
        options: ["Ring signatures", "ZK-SNARKs only", "MPC only", "Trusted Execution Environments (TEEs)"],
        correctIndex: 3,
      },
      {
        question: "Arc's initial confidential transfer feature primarily obscures:",
        options: ["Sender and receiver addresses", "Transaction amounts/values", "Smart contract bytecode", "Block timestamps"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 10, title: "Arc Core Principles", emoji: "🚀",
    questions: [
      {
        question: "Arc's core philosophy is 'Built to coordinate, not ___':",
        options: ["Build", "Earn", "Control", "Scale"],
        correctIndex: 2,
      },
      {
        question: "Arc being 'market-neutral' means it is interoperable via:",
        options: ["Circle CCTP and Gateway across the multichain ecosystem", "Only Arc's own bridge", "Ethereum mainnet only", "A closed partner network"],
        correctIndex: 0,
      },
      {
        question: "While Arc validator participation is permissioned, building on Arc is:",
        options: ["Private and invite-only", "Only for Circle partners", "Restricted to enterprises", "Fully open to all developers"],
        correctIndex: 3,
      },
    ],
  },
]
