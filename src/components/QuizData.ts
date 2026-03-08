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

// correctIndex MUST match ArcQuiz.sol _loadQuizzes() answer indices exactly
export const QUIZZES: QuizData[] = [
  {
    // Contract: a0=_h(1,0,1), a1=_h(1,1,0), a2=_h(1,2,3)
    id: 1, title: "What is Arc?", emoji: "🌐",
    questions: [
      {
        question: "What kind of blockchain is Arc?",
        options: ["A Layer-2 on Ethereum", "A Layer-1 built by Circle", "A sidechain of Polygon", "A private enterprise chain"],
        correctIndex: 1, // index 1 = "A Layer-1 built by Circle"
      },
      {
        question: "What does Arc use as gas for transactions?",
        options: ["USDC", "ETH", "ARC token", "BTC"],
        correctIndex: 0, // index 0 = "USDC"
      },
      {
        question: "What is Arc's testnet Chain ID?",
        options: ["1", "137", "8453", "5042002"],
        correctIndex: 3, // index 3 = "5042002"
      },
    ],
  },
  {
    // Contract: a0=_h(2,0,2), a1=_h(2,1,1), a2=_h(2,2,0)
    id: 2, title: "Arc & USDC", emoji: "💵",
    questions: [
      {
        question: "How does USDC exist on Arc?",
        options: ["Bridged from Ethereum", "Wrapped from Solana", "Native, not bridged", "Synthetic stablecoin"],
        correctIndex: 2, // index 2 = "Native, not bridged"
      },
      {
        question: "Arc's native USDC address starts with:",
        options: ["0x1c7D...", "0x3600...", "0xA0b8...", "0x0000..."],
        correctIndex: 1, // index 1 = "0x3600..."
      },
      {
        question: "Which company created both USDC and Arc?",
        options: ["Circle", "Tether", "MakerDAO", "Paxos"],
        correctIndex: 0, // index 0 = "Circle"
      },
    ],
  },
  {
    // Contract: a0=_h(3,0,1), a1=_h(3,1,2), a2=_h(3,2,0)
    id: 3, title: "Arc Technology", emoji: "⚙️",
    questions: [
      {
        question: "Is Arc compatible with Ethereum developer tools?",
        options: ["No, requires custom SDK", "Yes, it is EVM-compatible", "Only for read operations", "Partially compatible"],
        correctIndex: 1, // index 1 = "Yes, it is EVM-compatible"
      },
      {
        question: "What is Arc's transaction finality speed?",
        options: ["~10 minutes like Bitcoin", "~1 minute", "Deterministic sub-second", "~30 seconds"],
        correctIndex: 2, // index 2 = "Deterministic sub-second"
      },
      {
        question: "What consensus engine does Arc use?",
        options: ["Malachite BFT", "Proof of Work", "Delegated PoS", "Tendermint v1"],
        correctIndex: 0, // index 0 = "Malachite BFT"
      },
    ],
  },
  {
    // Contract: a0=_h(4,0,3), a1=_h(4,1,1), a2=_h(4,2,2)
    id: 4, title: "Arc Ecosystem", emoji: "🗺️",
    questions: [
      {
        question: "Where is Arc's testnet block explorer?",
        options: ["etherscan.io", "polygonscan.com", "arcscan.io", "testnet.arcscan.app"],
        correctIndex: 3, // index 3 = "testnet.arcscan.app"
      },
      {
        question: "Where can you get testnet USDC for Arc?",
        options: ["arc.faucet.io", "faucet.circle.com", "testnet.arc.faucet", "uniswap.org"],
        correctIndex: 1, // index 1 = "faucet.circle.com"
      },
      {
        question: "What is Arc's testnet RPC URL?",
        options: ["mainnet.arc.network", "node.arc.io", "rpc.testnet.arc.network", "api.arc.network"],
        correctIndex: 2, // index 2 = "rpc.testnet.arc.network"
      },
    ],
  },
  {
    // Contract: a0=_h(5,0,0), a1=_h(5,1,3), a2=_h(5,2,1)
    id: 5, title: "Arc vs Other Chains", emoji: "⚔️",
    questions: [
      {
        question: "Unlike Ethereum, Arc uses what for gas fees?",
        options: ["USDC stablecoin", "ARC native token", "No fees at all", "Wrapped BTC"],
        correctIndex: 0, // index 0 = "USDC stablecoin"
      },
      {
        question: "What key problem does Arc's fee design solve?",
        options: ["Slow transaction speed", "Low developer adoption", "Smart contract bugs", "Gas price volatility"],
        correctIndex: 3, // index 3 = "Gas price volatility"
      },
      {
        question: "Arc is primarily designed for:",
        options: ["Gaming NFTs only", "Payments and DeFi", "Social media dApps", "Private mining pools"],
        correctIndex: 1, // index 1 = "Payments and DeFi"
      },
    ],
  },
  {
    // Contract: a0=_h(6,0,2), a1=_h(6,1,0), a2=_h(6,2,3)
    id: 6, title: "Arc Smart Contracts", emoji: "📜",
    questions: [
      {
        question: "Can you deploy existing Solidity contracts on Arc?",
        options: ["No, must rewrite", "Only with an Arc SDK", "Yes, no modification needed", "Only simple contracts"],
        correctIndex: 2, // index 2 = "Yes, no modification needed"
      },
      {
        question: "Does Arc support standard EVM opcodes?",
        options: ["Yes, fully supported", "No EVM support", "Only basic opcodes", "Most but not all"],
        correctIndex: 0, // index 0 = "Yes, fully supported"
      },
      {
        question: "Which web3 libraries work with Arc out of the box?",
        options: ["Only ethers.js", "Only web3.js", "Requires Arc SDK only", "wagmi and viem"],
        correctIndex: 3, // index 3 = "wagmi and viem"
      },
    ],
  },
  {
    // Contract: a0=_h(7,0,1), a1=_h(7,1,2), a2=_h(7,2,0)
    id: 7, title: "Arc & Circle", emoji: "🏢",
    questions: [
      {
        question: "Circle is known for issuing which stablecoin?",
        options: ["USDT", "USDC", "DAI", "BUSD"],
        correctIndex: 1, // index 1 = "USDC"
      },
      {
        question: "Arc integrates directly with:",
        options: ["MetaMask only", "Binance Smart Chain", "Circle's full-stack platform", "Solana ecosystem"],
        correctIndex: 2, // index 2 = "Circle's full-stack platform"
      },
      {
        question: "Circle operates which cross-chain interoperability protocol?",
        options: ["Circle CCTP", "Wormhole", "LayerZero", "Axelar"],
        correctIndex: 0, // index 0 = "Circle CCTP"
      },
    ],
  },
  {
    // Contract: a0=_h(8,0,3), a1=_h(8,1,1), a2=_h(8,2,2)
    id: 8, title: "Arc Transactions", emoji: "⚡",
    questions: [
      {
        question: "Arc transaction fees are paid in:",
        options: ["ETH", "ARC token", "BTC", "USDC"],
        correctIndex: 3, // index 3 = "USDC"
      },
      {
        question: "Arc's finality is described as:",
        options: ["Probabilistic 10-min", "Deterministic sub-second", "1-hour settlement", "Eventually consistent"],
        correctIndex: 1, // index 1 = "Deterministic sub-second"
      },
      {
        question: "Arc transaction fees are:",
        options: ["Volatile like ETH gas", "Free always", "Predictable fiat-based", "Paid in multiple tokens"],
        correctIndex: 2, // index 2 = "Predictable fiat-based"
      },
    ],
  },
  {
    // Contract: a0=_h(9,0,0), a1=_h(9,1,3), a2=_h(9,2,1)
    id: 9, title: "Arc DeFi", emoji: "🏦",
    questions: [
      {
        question: "Why is Arc ideal for institutional DeFi?",
        options: ["USDC-native with stable fees", "Highest APY yields", "Fully anonymous transactions", "No smart contracts needed"],
        correctIndex: 0, // index 0 = "USDC-native with stable fees"
      },
      {
        question: "Arc enables 'agentic commerce', meaning:",
        options: ["Human-only transactions", "Only Circle can transact", "Offline payment systems", "AI agents transact natively onchain"],
        correctIndex: 3, // index 3 = "AI agents transact natively onchain"
      },
      {
        question: "Arc enables what kind of end-user UX?",
        options: ["Complex multi-step flows", "Predictable low-fee experience", "Always requires ETH wallet", "Slow confirmation times"],
        correctIndex: 1, // index 1 = "Predictable low-fee experience"
      },
    ],
  },
  {
    // Contract: a0=_h(10,0,2), a1=_h(10,1,0), a2=_h(10,2,3)
    id: 10, title: "Arc Core Principles", emoji: "🚀",
    questions: [
      {
        question: "Arc's philosophy is 'Built to coordinate, not ___':",
        options: ["Build", "Earn", "Control", "Scale"],
        correctIndex: 2, // index 2 = "Control"
      },
      {
        question: "Arc is described as 'market-neutral', meaning:",
        options: ["Interoperable via Circle CCTP", "Only supports one token", "No fees ever", "Closed to outside developers"],
        correctIndex: 0, // index 0 = "Interoperable via Circle CCTP"
      },
      {
        question: "Arc is a ___ network open to all developers:",
        options: ["Private", "Invite-only", "Circle-only", "Public"],
        correctIndex: 3, // index 3 = "Public"
      },
    ],
  },
]
