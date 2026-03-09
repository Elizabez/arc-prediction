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

// correctIndex MUST match ArcQuiz.sol exactly:
// Q1: 1,0,3 | Q2: 2,1,0 | Q3: 1,2,0 | Q4: 3,1,2 | Q5: 0,3,1
// Q6: 2,0,3 | Q7: 1,2,0 | Q8: 3,1,2 | Q9: 0,3,1 | Q10: 2,0,3

export const QUIZZES: QuizData[] = [
  {
    id: 1, title: "Welcome to Arc", emoji: "🌐",
    questions: [
      {
        // contract a0 = _h(1,0,1) → correctIndex 1
        question: "Arc is described as the 'Economic OS for the internet'. Who built Arc?",
        options: ["Ethereum Foundation", "Circle Internet Group", "Coinbase", "Binance Labs"],
        correctIndex: 1,
      },
      {
        // contract a1 = _h(1,1,0) → correctIndex 0
        question: "What is Arc's native gas token?",
        options: ["USDC", "ETH", "ARC", "EURC"],
        correctIndex: 0,
      },
      {
        // contract a2 = _h(1,2,3) → correctIndex 3
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
        // contract a0 = _h(2,0,2) → correctIndex 2
        question: "Why does Arc use USDC as gas instead of a volatile token?",
        options: ["To reward validators more", "To increase token price", "For predictable, stable transaction costs", "To reduce block size"],
        correctIndex: 2,
      },
      {
        // contract a1 = _h(2,1,1) → correctIndex 1
        question: "Arc's fee model is described as:",
        options: ["High and variable like ETH", "Low, predictable, dollar-denominated", "Free for all users", "Only free for enterprises"],
        correctIndex: 1,
      },
      {
        // contract a2 = _h(2,2,0) → correctIndex 0
        question: "In the future, Arc's Circle Paymaster roadmap includes support for gas paid in:",
        options: ["EURC and other regulated stablecoins", "BTC only", "SOL", "NFTs"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 3, title: "Deterministic Finality", emoji: "⚡",
    questions: [
      {
        // contract a0 = _h(3,0,1) → correctIndex 1
        question: "What type of finality does Arc provide?",
        options: ["Probabilistic like Bitcoin", "Deterministic sub-second", "Eventual consistency", "2-minute confirmation"],
        correctIndex: 1,
      },
      {
        // contract a1 = _h(3,1,2) → correctIndex 2
        question: "Arc's finality benchmark shows approximately ___ ms for 100 validators with 1MB blocks:",
        options: ["2000ms", "1500ms", "780ms", "300ms"],
        correctIndex: 2,
      },
      {
        // contract a2 = _h(3,2,0) → correctIndex 0
        question: "What consensus engine powers Arc's fast finality?",
        options: ["Malachite BFT", "Proof of Work", "Delegated PoS", "Snowball consensus"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 4, title: "Arc Ecosystem", emoji: "🗺️",
    questions: [
      {
        // contract a0 = _h(4,0,3) → correctIndex 3
        question: "Where is Arc's official testnet block explorer?",
        options: ["etherscan.io", "polygonscan.com", "arcscan.io", "testnet.arcscan.app"],
        correctIndex: 3,
      },
      {
        // contract a1 = _h(4,1,1) → correctIndex 1
        question: "Where can developers get free testnet USDC for Arc?",
        options: ["arc.faucet.io", "faucet.circle.com", "testnet.arc.faucet", "uniswap.org"],
        correctIndex: 1,
      },
      {
        // contract a2 = _h(4,2,2) → correctIndex 2
        question: "What is Arc's testnet RPC endpoint?",
        options: ["mainnet.arc.network", "node.arc.io", "rpc.testnet.arc.network", "api.arc.network"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 5, title: "Arc vs Other Chains", emoji: "⚔️",
    questions: [
      {
        // contract a0 = _h(5,0,0) → correctIndex 0
        question: "Unlike Ethereum which uses ETH for gas, Arc uses:",
        options: ["USDC stablecoin", "A new ARC token", "No gas at all", "Wrapped BTC"],
        correctIndex: 0,
      },
      {
        // contract a1 = _h(5,1,3) → correctIndex 3
        question: "What major problem for enterprises does Arc's USDC gas model solve?",
        options: ["Slow developer onboarding", "Lack of smart contracts", "Low transaction throughput", "Gas price volatility"],
        correctIndex: 3,
      },
      {
        // contract a2 = _h(5,2,1) → correctIndex 1
        question: "Arc is purpose-built for which primary use cases?",
        options: ["Gaming NFTs and metaverse", "Payments, FX, and capital markets", "Social media and DAOs", "Privacy coins only"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 6, title: "EVM Compatibility", emoji: "🔧",
    questions: [
      {
        // contract a0 = _h(6,0,2) → correctIndex 2
        question: "Can existing Solidity smart contracts be deployed on Arc?",
        options: ["No, must be rewritten", "Only with an Arc-specific SDK", "Yes, without modification", "Only simple ERC-20 contracts"],
        correctIndex: 2,
      },
      {
        // contract a1 = _h(6,1,0) → correctIndex 0
        question: "Which developer tools are compatible with Arc out of the box?",
        options: ["wagmi, viem, ethers.js, Hardhat", "Only Truffle Suite", "Requires Arc CLI only", "None, custom tooling needed"],
        correctIndex: 0,
      },
      {
        // contract a2 = _h(6,2,3) → correctIndex 3
        question: "Arc is described as a public ___ network:",
        options: ["Proof-of-Work", "Zero-knowledge", "Permissioned private", "EVM-compatible Layer-1"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 7, title: "Arc & Circle", emoji: "🏢",
    questions: [
      {
        // contract a0 = _h(7,0,1) → correctIndex 1
        question: "Circle went public via IPO in June 2025, raising approximately:",
        options: ["$500 million", "$1.2 billion", "$3 billion", "$800 million"],
        correctIndex: 1,
      },
      {
        // contract a1 = _h(7,1,2) → correctIndex 2
        question: "Arc integrates directly with Circle's full-stack platform, which includes:",
        options: ["Only USDC and CCTP", "Only Circle Wallets", "USDC, EURC, CCTP, Gateway, Paymaster, and more", "Only Circle Mint"],
        correctIndex: 2,
      },
      {
        // contract a2 = _h(7,2,0) → correctIndex 0
        question: "Which Circle protocol enables USDC transfers across multiple blockchains via burn-and-mint?",
        options: ["CCTP", "Wormhole", "LayerZero", "Axelar"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 8, title: "Arc Transactions", emoji: "💸",
    questions: [
      {
        // contract a0 = _h(8,0,3) → correctIndex 3
        question: "All Arc transaction fees are paid in:",
        options: ["ETH", "ARC token", "BTC", "USDC"],
        correctIndex: 3,
      },
      {
        // contract a1 = _h(8,1,1) → correctIndex 1
        question: "Arc's sub-second finality benefits which use cases most?",
        options: ["Long-term staking only", "Real-time payments and capital markets settlement", "Mining pool operations", "Offline transactions"],
        correctIndex: 1,
      },
      {
        // contract a2 = _h(8,2,2) → correctIndex 2
        question: "Arc fee predictability helps enterprises with:",
        options: ["Token speculation", "Validator rewards", "Accounting and treasury workflows", "NFT minting only"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 9, title: "Opt-in Privacy", emoji: "🔒",
    questions: [
      {
        // contract a0 = _h(9,0,0) → correctIndex 0
        question: "Arc's privacy feature is designed to help institutions:",
        options: ["Stay compliant while protecting sensitive tx data", "Hide transactions from all regulators forever", "Avoid paying gas fees", "Mine blocks anonymously"],
        correctIndex: 0,
      },
      {
        // contract a1 = _h(9,1,3) → correctIndex 3
        question: "Arc's privacy architecture uses which technology for private processing?",
        options: ["Ring signatures", "ZK-SNARKs only", "MPC only", "Trusted Execution Environments (TEEs)"],
        correctIndex: 3,
      },
      {
        // contract a2 = _h(9,2,1) → correctIndex 1
        question: "Arc's initial privacy feature (confidential transfers) obscures:",
        options: ["Sender and receiver addresses", "Transaction values only", "All data including contract code", "Block timestamps"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 10, title: "Arc Core Principles", emoji: "🚀",
    questions: [
      {
        // contract a0 = _h(10,0,2) → correctIndex 2
        question: "Arc's philosophy is 'Built to coordinate, not ___':",
        options: ["Build", "Earn", "Control", "Scale"],
        correctIndex: 2,
      },
      {
        // contract a1 = _h(10,1,0) → correctIndex 0
        question: "Arc being 'market-neutral' means it is interoperable via:",
        options: ["Circle CCTP and Gateway across the multichain ecosystem", "Only Arc's own bridge", "Ethereum mainnet only", "A closed partner network"],
        correctIndex: 0,
      },
      {
        // contract a2 = _h(10,2,3) → correctIndex 3
        question: "While validator participation on Arc is permissioned, access to build on Arc is:",
        options: ["Private and invite-only", "Only for Circle partners", "Restricted to enterprises", "Fully open to all developers"],
        correctIndex: 3,
      },
    ],
  },
]
