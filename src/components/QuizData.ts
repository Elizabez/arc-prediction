// ArcQuiz contract ABI
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
    id: 1, title: "What is Arc?", emoji: "🌐",
    questions: [
      {
        question: "Who built the Arc blockchain?",
        options: ["Ethereum Foundation", "Circle", "Binance", "Coinbase"],
        correctIndex: 1,
      },
      {
        question: "What token is used as gas on Arc?",
        options: ["USDC", "ETH", "ARC", "MATIC"],
        correctIndex: 0,
      },
      {
        question: "What is Arc's Chain ID on testnet?",
        options: ["1", "137", "8453", "5042002"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 2, title: "Arc & USDC", emoji: "💵",
    questions: [
      {
        question: "How does USDC exist on Arc?",
        options: ["Wrapped from Ethereum", "Bridged from Solana", "Native, not bridged", "Synthetic stablecoin"],
        correctIndex: 2,
      },
      {
        question: "Arc's native USDC address starts with:",
        options: ["0x1c7D...", "0x3600...", "0xA0b8...", "0x0000..."],
        correctIndex: 1,
      },
      {
        question: "Which company created both USDC and Arc?",
        options: ["Circle", "Tether", "MakerDAO", "Paxos"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 3, title: "Arc Technology", emoji: "⚙️",
    questions: [
      {
        question: "Is Arc compatible with Ethereum tooling?",
        options: ["No, custom VM", "Yes, EVM-compatible", "Partially", "Only for reading"],
        correctIndex: 1,
      },
      {
        question: "How fast is Arc's transaction finality?",
        options: ["~10 minutes", "~1 minute", "Under 1 second", "~10 seconds"],
        correctIndex: 2,
      },
      {
        question: "What consensus mechanism does Arc use?",
        options: ["Proof of Authority", "Proof of Work", "Proof of Stake", "DPoS"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 4, title: "Arc Ecosystem", emoji: "🗺️",
    questions: [
      {
        question: "Where is Arc's testnet block explorer?",
        options: ["etherscan.io", "polygonscan.com", "testnet.arcscan.app", "explorer.solana.com"],
        correctIndex: 3,
      },
      {
        question: "Where can you get testnet USDC for Arc?",
        options: ["arc.faucet.io", "faucet.circle.com", "testnet.arc.faucet", "circle.testnet.io"],
        correctIndex: 1,
      },
      {
        question: "What is Arc's testnet RPC URL?",
        options: ["mainnet.arc.network", "api.arc.network", "rpc.testnet.arc.network", "node.arc.io"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 5, title: "Arc vs Other Chains", emoji: "⚔️",
    questions: [
      {
        question: "Unlike Ethereum, Arc uses what for gas fees?",
        options: ["USDC instead of ETH", "ARC token", "No gas fees", "BTC"],
        correctIndex: 0,
      },
      {
        question: "What problem does Arc solve with USDC gas?",
        options: ["Slow finality", "High TPS", "Gas price volatility", "Privacy"],
        correctIndex: 3,
      },
      {
        question: "Arc is primarily designed for:",
        options: ["Gaming NFTs", "Payments and DeFi", "Social media", "Gaming"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 6, title: "Arc Smart Contracts", emoji: "📜",
    questions: [
      {
        question: "Can you deploy Solidity contracts on Arc without changes?",
        options: ["No, need rewrite", "Partially", "Yes, no modification needed", "Only simple contracts"],
        correctIndex: 2,
      },
      {
        question: "Does Arc support standard EVM opcodes?",
        options: ["Yes, fully", "No", "Only basic ones", "Most but not all"],
        correctIndex: 0,
      },
      {
        question: "Which web3 libraries work with Arc out of the box?",
        options: ["Only ethers.js", "Only web3.js", "None, need Arc SDK", "wagmi and viem"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 7, title: "Arc & Circle", emoji: "🏢",
    questions: [
      {
        question: "Circle is known for issuing which stablecoin?",
        options: ["USDT", "USDC", "DAI", "BUSD"],
        correctIndex: 1,
      },
      {
        question: "Arc is Circle's:",
        options: ["Payment processor", "First blockchain", "Wallet product", "Exchange"],
        correctIndex: 2,
      },
      {
        question: "Circle also operates which cross-chain protocol?",
        options: ["CCTP bridge", "Wormhole", "LayerZero", "Axelar"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 8, title: "Arc Transactions", emoji: "⚡",
    questions: [
      {
        question: "Arc transaction fees are paid in:",
        options: ["ETH", "ARC token", "BTC", "USDC"],
        correctIndex: 3,
      },
      {
        question: "Arc has _____ finality.",
        options: ["10-minute", "Sub-second", "1-hour", "1-minute"],
        correctIndex: 1,
      },
      {
        question: "Arc transaction costs are:",
        options: ["Volatile like ETH", "Free always", "Predictable and stable", "Paid in multiple tokens"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 9, title: "Arc DeFi", emoji: "🏦",
    questions: [
      {
        question: "Why is Arc ideal for stablecoin DeFi?",
        options: ["USDC-native chain", "High APY", "Anonymous txs", "No smart contracts"],
        correctIndex: 0,
      },
      {
        question: "Do you need to wrap USDC on Arc?",
        options: ["Yes always", "Only for DeFi", "Sometimes", "No, not needed"],
        correctIndex: 3,
      },
      {
        question: "Arc enables what kind of UX for end users?",
        options: ["Complex multi-step", "Gasless UX experience", "Always requires ETH", "Slow confirmations"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 10, title: "Arc Future", emoji: "🚀",
    questions: [
      {
        question: "Arc aims to be the chain for:",
        options: ["Gaming only", "NFT speculation", "Real-world payments", "Private transactions"],
        correctIndex: 2,
      },
      {
        question: "Arc mainnet will use:",
        options: ["Real USDC", "A new token", "Wrapped ETH", "ARC governance token"],
        correctIndex: 0,
      },
      {
        question: "Arc is:",
        options: ["Closed to developers", "Only for Circle partners", "Invite-only", "Fully open for developers"],
        correctIndex: 3,
      },
    ],
  },
]
